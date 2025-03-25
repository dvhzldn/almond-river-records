import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Define a proper interface for vinyl records.
interface VinylRecord {
	id: string;
	artist_names: string[];
	title: string;
	price: number;
}

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
	try {
		const body = await request.json();
		console.log("processOrder: Received request body:", body);

		const { amount, description, recordIds, orderData } = body;
		if (!amount || !description || !recordIds || !orderData) {
			console.error("processOrder: Missing required fields in the payload");
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Generate checkout reference.
		const now = new Date();
		const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
		const uniqueSuffix = now.getTime(); // milliseconds timestamp
		const checkoutReference = `${today}-${uniqueSuffix}`;
		console.log(
			"processOrder: Generated checkoutReference:",
			checkoutReference
		);

		// Compute a checkout description for SumUp.
		const checkoutDescription = `${recordIds.length} x ${
			recordIds.length === 1 ? "record" : "records"
		} plus postage.`;
		console.log(
			"processOrder: Computed checkoutDescription:",
			checkoutDescription
		);

		// SumUp API variables.
		const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
		const merchant_code = process.env.SUMUP_MERCHANT_CODE;
		if (!accessToken || !merchant_code) {
			console.error("processOrder: SumUp API key or merchant code not set");
			return NextResponse.json(
				{ error: "Missing SumUp configuration" },
				{ status: 500 }
			);
		}

		// Build the redirect URL (set to your homepage or an appropriate page)
		const paymentSuccessUrl = process.env.NEXT_PUBLIC_BASE_URL;
		const redirectUrl = paymentSuccessUrl;
		console.log("processOrder: Using redirectUrl:", redirectUrl);

		const requestBody = {
			amount,
			currency: "GBP",
			checkout_reference: checkoutReference,
			description: checkoutDescription,
			merchant_code,
			hosted_checkout: { enabled: true },
			redirect_url: redirectUrl,
		};

		console.log(
			"processOrder: Sending request to SumUp with payload:",
			requestBody
		);

		// Call SumUp API.
		const sumupResponse = await fetch(
			"https://api.sumup.com/v0.1/checkouts",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			}
		);
		console.log("processOrder: SumUp response status:", sumupResponse.status);

		const paymentData = await sumupResponse.json();
		console.log(
			"processOrder: Received paymentData from SumUp:",
			paymentData
		);

		if (!sumupResponse.ok) {
			console.error("processOrder: SumUp API error:", paymentData);
			return NextResponse.json(
				{ error: "Checkout creation failed", details: paymentData },
				{ status: sumupResponse.status }
			);
		}

		if (
			!paymentData.hosted_checkout_url ||
			!paymentData.id ||
			!paymentData.checkout_reference
		) {
			console.error(
				"processOrder: Incomplete paymentData returned from SumUp:",
				paymentData
			);
			return NextResponse.json(
				{
					error: "Payment not processed. No checkout URL returned.",
					details: paymentData,
				},
				{ status: 400 }
			);
		}

		console.log(
			"processOrder: SumUp returned hosted_checkout_url:",
			paymentData.hosted_checkout_url
		);

		const checkoutId = paymentData.id;
		const orderDate = now.toISOString();

		// Insert order record into Supabase.
		const orderRecord = {
			order_date: orderDate,
			customer_name: orderData.name,
			customer_email: orderData.email,
			address1: orderData.address1,
			address2: orderData.address2,
			address3: orderData.address3,
			city: orderData.city,
			postcode: orderData.postcode,
			sumup_amount: amount,
			sumup_checkout_reference: checkoutReference,
			sumup_date: orderDate,
			sumup_id: checkoutId,
			sumup_status: "PENDING",
			sumup_status_history: [{ status: "PENDING", changed_at: orderDate }],
			sumup_hosted_checkout_url: paymentData.hosted_checkout_url,
			sumup_transactions: paymentData.transactions || [],
			order_confirmation_email_sent: false,
		};

		console.log(
			"processOrder: Inserting order record into Supabase:",
			orderRecord
		);
		const { data: orderInsertData, error: orderInsertError } =
			await supabaseService.from("orders").insert(orderRecord).select();

		if (orderInsertError) {
			console.error(
				"processOrder: Error inserting order record:",
				orderInsertError
			);
			return NextResponse.json(
				{ error: "Failed to log order. Please try again." },
				{ status: 500 }
			);
		}
		console.log(
			"processOrder: Order inserted successfully:",
			orderInsertData
		);

		// Fetch vinyl record details from Supabase.
		const { data: vinylRecords, error: vinylError } = await supabaseService
			.from("vinyl_records")
			.select("id, artist_names, title, price")
			.in("id", recordIds);
		if (vinylError) {
			console.error(
				"processOrder: Error fetching vinyl records:",
				vinylError
			);
			return NextResponse.json(
				{ error: "Failed to retrieve record details" },
				{ status: 500 }
			);
		}
		console.log("processOrder: Fetched vinyl records:", vinylRecords);

		// Insert order items with complete details.
		const orderId = orderInsertData[0].id;
		const orderItemsData = recordIds.map((recordId: string) => {
			const record = vinylRecords.find(
				(r: VinylRecord) => r.id === recordId
			);
			if (!record) {
				const errMsg = `processOrder: No vinyl record found for id: ${recordId}`;
				console.error(errMsg);
				throw new Error(errMsg);
			}
			return {
				order_id: orderId,
				vinyl_record_id: recordId,
				artist_names: record.artist_names,
				title: record.title,
				price: record.price,
			};
		});
		console.log("processOrder: Inserting order items:", orderItemsData);

		const { error: orderItemsError } = await supabaseService
			.from("order_items")
			.insert(orderItemsData);

		if (orderItemsError) {
			console.error(
				"processOrder: Error inserting order items:",
				orderItemsError
			);
			return NextResponse.json(
				{ error: "Failed to log order items. Please try again." },
				{ status: 500 }
			);
		}

		console.log("processOrder: Order items inserted successfully.");

		return NextResponse.json(
			{
				hosted_checkout_url: paymentData.hosted_checkout_url,
				checkout_reference: paymentData.checkout_reference,
				orderDate,
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("processOrder: Error processing order:", err);
			return NextResponse.json(
				{ error: "Server error", details: err.message },
				{ status: 500 }
			);
		} else {
			console.error("processOrder: Unexpected error:", err);
			return NextResponse.json(
				{ error: "Server error", details: "An unexpected error occurred." },
				{ status: 500 }
			);
		}
	}
}
