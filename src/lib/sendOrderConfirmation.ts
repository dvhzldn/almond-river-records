// lib/sendOrderConfirmation.ts

import { SupabaseClient } from "@supabase/supabase-js";
import { logOrderEvent } from "@/lib/logOrderEvent";
import type { Order, OrderItem } from "./types";
import { sendOrderConfirmation } from "@/lib/sendOrderConfirmation";

export async function sendOrderConfirmation(
	supabase: SupabaseClient,
	order: Order,
	orderItems: OrderItem[]
): Promise<void> {
	if (order.order_confirmation_email_sent) return;

	// Update DB flag first to prevent race conditions
	await supabase
		.from("orders")
		.update({ order_confirmation_email_sent: true })
		.eq("sumup_checkout_reference", order.sumup_checkout_reference);

	const { sendOrderConfirmationEmail } = await import("@/lib/resendClient");
	await sendOrderConfirmationEmail(order, orderItems);

	await logOrderEvent({
		event: "email-sent",
		checkout_reference: order.sumup_checkout_reference,
		message: "Order confirmation email sent via shared utility.",
	});
}
