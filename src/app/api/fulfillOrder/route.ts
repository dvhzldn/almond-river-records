import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
	try {
		console.log("fulfillOrder: Request received");
		const { checkoutReference } = await request.json();
		console.log(
			"fulfillOrder: Checkout reference received:",
			checkoutReference
		);

		if (!checkoutReference) {
			console.error(
				"fulfillOrder: Missing checkoutReference in request body"
			);
			return NextResponse.json(
				{ error: "Missing checkoutReference" },
				{ status: 400 }
			);
		}

		// Fetch the order along with its order items in one call.
		const { data: orderData, error: orderError } = await supabaseService
			.from("orders")
			.select(`*, order_items(*)`)
			.eq("sumup_checkout_reference", checkoutReference)
			.single();

		if (orderError || !orderData) {
			console.error("fulfillOrder: Error fetching order data:", orderError);
			return NextResponse.json(
				{ error: "Order not found" },
				{ status: 404 }
			);
		}
		console.log("fulfillOrder: Order data fetched:", orderData);

		const order = orderData;
		const orderItems = orderData.order_items;
		console.log(
			"fulfillOrder: Current email sent flag:",
			order.order_confirmation_email_sent
		);

		// Update the flag immediately if email has not been sent.
		if (!order.order_confirmation_email_sent) {
			console.log(
				"fulfillOrder: Email not sent yet. Updating flag before sending email..."
			);
			const { error: updateEmailError } = await supabaseService
				.from("orders")
				.update({ order_confirmation_email_sent: true })
				.eq("sumup_checkout_reference", checkoutReference);

			if (updateEmailError) {
				console.error(
					"fulfillOrder: Error updating email sent flag:",
					updateEmailError
				);
				return NextResponse.json(
					{ error: "Failed to update email flag" },
					{ status: 500 }
				);
			}
			console.log(
				"fulfillOrder: Email flag updated. Proceeding to send confirmation email..."
			);
			await sendOrderConfirmationEmail(order, orderItems);
			console.log("fulfillOrder: Confirmation email sent successfully.");
		} else {
			console.log(
				"fulfillOrder: Confirmation email already sent; skipping email send."
			);
		}

		// Update inventory for each order item.
		for (const item of orderItems) {
			console.log(
				`fulfillOrder: Updating inventory for record ${item.vinyl_record_id}`
			);
			const { error } = await supabaseService
				.from("vinyl_records")
				.update({ quantity: 0 })
				.eq("id", item.vinyl_record_id);
			if (error) {
				console.error(
					`fulfillOrder: Error updating inventory for record ${item.vinyl_record_id}:`,
					error
				);
			} else {
				console.log(
					`fulfillOrder: Inventory updated to 0 for record ${item.vinyl_record_id}`
				);
			}
		}

		console.log("fulfillOrder: Order fulfillment complete");
		return NextResponse.json(
			{ message: "Order fulfillment complete" },
			{ status: 200 }
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("fulfillOrder: Error in order fulfillment:", error);
			return NextResponse.json(
				{ error: "Server error", details: error.message },
				{ status: 500 }
			);
		} else {
			console.error("fulfillOrder: Unexpected error:", error);
			return NextResponse.json(
				{ error: "Server error", details: "An unexpected error occurred." },
				{ status: 500 }
			);
		}
	}
}
