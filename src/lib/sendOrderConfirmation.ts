import { SupabaseClient } from "@supabase/supabase-js";
import { logOrderEvent } from "@/lib/logOrderEvent";

interface OrderItem {
	vinyl_record_id: string;
	artist_names: string[];
	title: string;
	price: number;
}

interface Order {
	id: string;
	customer_name: string;
	customer_email: string;
	address1: string;
	address2: string;
	address3: string;
	city: string;
	postcode: string;
	order_date: string;
	sumup_status: string;
	sumup_checkout_reference: string;
	sumup_id: string;
	sumup_amount: number;
	order_confirmation_email_sent: boolean;
	order_items: OrderItem[];
}
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
