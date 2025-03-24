// /app/api/processOrder/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "contentful-management";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { amount, recordIds, orderData } = body; // orderData: { name, email, address1, address2, address3, city, postcode }
		const recordIdsArray = Array.isArray(recordIds)
			? recordIds
			: recordIds.split(",").map((r: string) => r.trim());

		// Generate checkout reference.
		const now = new Date();
		const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
		const uniqueSuffix = now.getTime(); // milliseconds timestamp
		const checkoutReference = `${today}-${uniqueSuffix}`;

		// Compute a checkout description for SumUp.
		const checkoutDescription = `${recordIdsArray.length} x ${
			recordIdsArray.length === 1 ? "record" : "records"
		} plus postage.`;

		// SumUp API variables.
		const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
		const merchant_code = process.env.SUMUP_MERCHANT_CODE;
		const paymentSuccessUrl =
			process.env.NEXT_PUBLIC_BASE_URL + "/payment-success";
		const redirectUrl = `${paymentSuccessUrl}?checkout_id=${checkoutReference}`;

		const requestBody = {
			amount,
			currency: "GBP",
			checkout_reference: checkoutReference,
			description: checkoutDescription,
			merchant_code,
			hosted_checkout: { enabled: true },
			redirect_url: redirectUrl, // Redirect to homepage if user cancels. Do not use return_url
		};

		// Include for testing
		// console.log("Sending request to SumUp API:", requestBody);

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

		// Step 2: Insert order into Supabase orders table.
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
		};

		const { data: orderInsertData, error: orderInsertError } = await supabase
			.from("orders")
			.insert(orderRecord)
			.select();

		if (orderInsertError) {
			console.error("Error inserting order:", orderInsertError);
			return NextResponse.json(
				{ error: "Failed to log order. Please try again." },
				{ status: 500 }
			);
		}
		const newOrder = orderInsertData[0];
		const orderId = newOrder.id;

		// Step 3: Fetch vinyl record details from Contentful and build order items.
		const managementClient = createClient({
			accessToken: process.env
				.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN as string,
		});
		const space = await managementClient.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
		);
		const environment = await space.getEnvironment(
			process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"
		);

		const orderItemsData = await Promise.all(
			recordIdsArray.map(async (recordId: string) => {
				try {
					const entry = await environment.getEntry(recordId);
					// Extract a snapshot of the record's key fields.
					const artistNames = entry.fields.artistName["en-GB"];
					const title = entry.fields.title["en-GB"];
					const price = entry.fields.price["en-GB"];
					return {
						order_id: orderId,
						vinyl_record_id: recordId,
						artist_names: artistNames,
						title: title,
						price: price,
					};
				} catch (err) {
					console.error(`Error fetching entry ${recordId}:`, err);
					return null;
				}
			})
		);
		const validOrderItems = orderItemsData.filter((item) => item !== null);

		const { error: orderItemsError } = await supabase
			.from("order_items")
			.insert(validOrderItems);
		if (orderItemsError) {
			console.error("Error inserting order items:", orderItemsError);
			return NextResponse.json(
				{ error: "Failed to log order items. Please try again." },
				{ status: 500 }
			);
		}

		// Step 4: Update inventory in Supabase.
		// TODO: Removed inventory update until order status is paid
		// await Promise.all(
		// 	recordIdsArray.map(async (recordId: string) => {
		// 		const { error } = await supabase
		// 			.from("vinyl_records")
		// 			.update({ quantity: 0 })
		// 			.eq("id", recordId);
		// 		if (error) {
		// 			console.error(`Error updating vinyl record ${recordId}:`, error);
		// 		}
		// 	})
		// );

		// Return the hosted checkout URL and order details.
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
