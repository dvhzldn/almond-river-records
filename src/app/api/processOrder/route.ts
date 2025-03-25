import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface VinylRecord {
	id: string;
	artist_names: string[];
	title: string;
	price: number;
}

interface OrderItem {
	order_id: number;
	vinyl_record_id: string;
	artist_names: string[];
	title: string;
	price: number;
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { amount, recordIds, orderData } = body;
		const recordIdsArray = Array.isArray(recordIds)
			? recordIds
			: recordIds.split(",").map((r: string) => r.trim());

		// Checkout reference.
		const now = new Date();
		const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
		const uniqueSuffix = now.getTime(); // milliseconds timestamp
		const checkoutReference = `${today}-${uniqueSuffix}`;

		// Checkout description.
		const checkoutDescription = `${recordIdsArray.length} x ${
			recordIdsArray.length === 1 ? "record" : "records"
		} plus postage.`;

		// SumUp API variables.
		const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
		const merchant_code = process.env.SUMUP_MERCHANT_CODE;

		// REMOVED REDIRECT URL FOR NOW
		// Redirect to payment success page with query strings
		// const paymentSuccessUrl =
		// 	process.env.NEXT_PUBLIC_BASE_URL + "/payment-success";
		// const redirectUrl = `${paymentSuccessUrl}?checkout_id=${checkoutReference}&status=PENDING`;

		const requestBody = {
			amount,
			currency: "GBP",
			checkout_reference: checkoutReference,
			description: checkoutDescription,
			merchant_code,
			hosted_checkout: { enabled: true },
			// redirect_url: redirectUrl, // ** Do not use return_url **
		};

		// For testing
		console.log("Sending request to SumUp API:", requestBody);

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

		if (!sumupResponse.ok) {
			const errorText = await sumupResponse.text();
			console.error(
				"SumUp API error:",
				errorText,
				"Request payload:",
				requestBody
			);
			return NextResponse.json(
				{ error: "Checkout creation failed", details: errorText },
				{ status: sumupResponse.status }
			);
		}

		const paymentData = await sumupResponse.json();

		if (
			!paymentData.hosted_checkout_url ||
			!paymentData.id ||
			!paymentData.checkout_reference
		) {
			return NextResponse.json(
				{ error: "Payment not processed. No checkout link available." },
				{ status: 400 }
			);
		}
		const checkoutId = paymentData.id;
		const generatedOrderId = paymentData.checkout_reference;
		const orderDate = now.toISOString();

		// Supabase orders table insert.
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
			email_sent: false,
		};

		const { data: orderInsertData, error: orderInsertError } =
			await supabaseService.from("orders").insert(orderRecord).select();

		if (orderInsertError) {
			console.error("Error inserting order:", orderInsertError);
			return NextResponse.json(
				{ error: "Failed to log order. Please try again." },
				{ status: 500 }
			);
		}
		const newOrder = orderInsertData[0];
		const orderId = newOrder.id;

		// Fetch vinyl record details and build order items.
		const { data: vinylRecords, error: vinylError } = await supabaseService
			.from("vinyl_records")
			.select("id, artist_names, title, price")
			.in("id", recordIdsArray);

		if (vinylError) {
			console.error("Error fetching vinyl records:", vinylError);
			return NextResponse.json(
				{ error: "Failed to retrieve record details. Please try again." },
				{ status: 500 }
			);
		}

		// Build the order items from the vinyl records data.
		const orderItemsData: OrderItem[] = vinylRecords.map(
			(record: VinylRecord) => ({
				order_id: orderId,
				vinyl_record_id: record.id,
				artist_names: record.artist_names,
				title: record.title,
				price: record.price,
			})
		);

		const { error: orderItemsError } = await supabaseService
			.from("order_items")
			.insert(orderItemsData);
		if (orderItemsError) {
			console.error("Error inserting order items:", orderItemsError);
			return NextResponse.json(
				{ error: "Failed to log order items. Please try again." },
				{ status: 500 }
			);
		}

		// Return hosted checkout URL and order details.
		return NextResponse.json({
			hosted_checkout_url: paymentData.hosted_checkout_url,
			checkout_reference: generatedOrderId,
			orderDate,
		});
	} catch (err: unknown) {
		console.error("Error processing order:", err);
		return NextResponse.json(
			{
				error: "Server error",
				details: err instanceof Error ? err.message : err,
			},
			{ status: 500 }
		);
	}
}
