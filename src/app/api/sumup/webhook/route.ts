import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update order status in Supabase orders table.
async function updateOrderStatus(orderReference: string, status: string) {
	const { error } = await supabaseService
		.from("orders")
		.update({ sumup_status: status })
		.eq("sumup_checkout_reference", orderReference);
	if (error) {
		console.error("Error updating order status in Supabase:", error);
		throw error;
	}
	console.log(
		`Updated order ${orderReference} status to ${status} in Supabase.`
	);
}

export async function POST(request: Request) {
	try {
		const payload = await request.json();
		console.log("Received SumUp webhook payload:", payload);

		if (payload.event_type === "checkout.status.updated") {
			const checkoutDetails = payload.payload;
			console.log("Verified checkout details:", checkoutDetails);

			const orderReference: string = checkoutDetails.reference;
			const checkoutStatus: string = checkoutDetails.status;

			if (checkoutStatus === "PAID") {
				// Update order status to PAID.
				await updateOrderStatus(orderReference, "PAID");

				// Trigger the fulfillment endpoint to handle email sending and inventory updates.
				const fulfillUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/fulfillOrder`;
				console.log("Calling fulfillment endpoint at:", fulfillUrl);
				const fulfillRes = await fetch(fulfillUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ checkoutReference: orderReference }),
				});
				if (!fulfillRes.ok) {
					const errText = await fulfillRes.text();
					console.error("Error triggering fulfillment endpoint:", errText);
				} else {
					console.log("Fulfillment endpoint triggered successfully");
				}
			} else if (checkoutStatus === "FAILED") {
				await updateOrderStatus(orderReference, "FAILED");
			} else {
				await updateOrderStatus(orderReference, "PENDING");
			}
		}

		// Return a 200 OK response as required by SumUp.
		return NextResponse.json({}, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error processing SumUp webhook:", error);
			return NextResponse.json(
				{ error: "Server error", details: error.message },
				{ status: 500 }
			);
		} else {
			console.error("Unexpected error:", error);
			return NextResponse.json(
				{ error: "Server error", details: "An unexpected error occurred." },
				{ status: 500 }
			);
		}
	}
}
