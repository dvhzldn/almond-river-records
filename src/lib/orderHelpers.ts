// lib/orderHelpers.ts
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fulfillOrderEmail(checkoutReference: string) {
	// Fetch the order
	const { data: order, error: orderError } = await supabaseService
		.from("orders")
		.select("*")
		.eq("sumup_checkout_reference", checkoutReference)
		.single();
	if (orderError || !order) {
		throw new Error("Order not found");
	}

	// Check if confirmation email is already sent
	if (order.order_confirmation_email_sent) {
		return { order, orderItems: null, emailAlreadySent: true };
	}

	// Fetch order items
	const { data: orderItems, error: orderItemsError } = await supabaseService
		.from("order_items")
		.select("*")
		.eq("order_id", order.id);
	if (orderItemsError || !orderItems) {
		throw new Error("Order items not found");
	}

	// Send the confirmation email
	await sendOrderConfirmationEmail(order, orderItems);

	// Update the order record to mark email as sent
	const { error: updateError } = await supabaseService
		.from("orders")
		.update({ order_confirmation_email_sent: true })
		.eq("sumup_checkout_reference", checkoutReference);
	if (updateError) {
		throw new Error("Failed to update email flag");
	}

	return { order, orderItems, emailAlreadySent: false };
}
