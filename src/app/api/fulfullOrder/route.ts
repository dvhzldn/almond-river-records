import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
	try {
		const { checkoutReference } = await request.json();
		if (!checkoutReference) {
			return NextResponse.json(
				{ error: "Missing checkoutReference" },
				{ status: 400 }
			);
		}

		// Fetch the order by checkout reference.
		const { data: order, error: orderError } = await supabaseService
			.from("orders")
			.select("*")
			.eq("sumup_checkout_reference", checkoutReference)
			.single();
		if (orderError || !order) {
			console.error("Error fetching order:", orderError);
			return NextResponse.json(
				{ error: "Order not found" },
				{ status: 404 }
			);
		}

		// Fetch associated order items.
		const { data: orderItems, error: orderItemsError } = await supabaseService
			.from("order_items")
			.select("*")
			.eq("order_id", order.id);
		if (orderItemsError || !orderItems) {
			console.error("Error fetching order items:", orderItemsError);
			return NextResponse.json(
				{ error: "Order items not found" },
				{ status: 404 }
			);
		}

		// Send the order confirmation email if not already sent.
		if (!order.order_confirmation_email_sent) {
			await sendOrderConfirmationEmail(order, orderItems);
			// Mark the email as sent in the order record.
			const { error: updateEmailError } = await supabaseService
				.from("orders")
				.update({ order_confirmation_email_sent: true })
				.eq("sumup_checkout_reference", checkoutReference);
			if (updateEmailError) {
				console.error("Error updating email sent flag:", updateEmailError);
			}
		}

		// Update inventory for each order item.
		for (const item of orderItems) {
			const { error } = await supabaseService
				.from("vinyl_records")
				.update({ quantity: 0 })
				.eq("id", item.vinyl_record_id);
			if (error) {
				console.error(
					`Error updating inventory for record ${item.vinyl_record_id}:`,
					error
				);
			} else {
				console.log(
					`Inventory updated to 0 for record ${item.vinyl_record_id}`
				);
			}
		}

		return NextResponse.json(
			{ message: "Order fulfillment complete" },
			{ status: 200 }
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error in order fulfillment:", error);
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
