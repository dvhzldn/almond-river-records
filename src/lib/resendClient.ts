export interface Order {
	id: string;
	customer_name: string;
	customer_email: string;
	order_date: string;
	sumup_checkout_reference: string;
	sumup_id: string;
	sumup_amount: number;
	address1: string;
	address2?: string;
	address3?: string;
	city: string;
	postcode: string;
}

export interface OrderItem {
	vinyl_record_id: string;
	artist_names: string[];
	title: string;
	price: number;
}

export async function sendOrderConfirmationEmail(
	order: Order,
	orderItems: OrderItem[]
) {
	const { Resend } = await import("resend");
	const resend = new Resend(process.env.RESEND_TRANSACTIONAL_API_KEY!);

	const itemsText = orderItems
		.map(
			(item) =>
				`- ${item.artist_names.join(" & ")} – ${item.title} (£${item.price.toFixed(2)})`
		)
		.join("\n");

	const shippingAddress =
		[order.address1, order.address2, order.address3]
			.filter(Boolean)
			.join(" & ") + `, ${order.city}, ${order.postcode}`;

	const text = `
Hi ${order.customer_name},

Thank you for your purchase!

We will process your order promptly and dispatch within two working days.

Order details:
${itemsText}

Total amount paid: £${order.sumup_amount.toFixed(2)}

Shipping address:
${shippingAddress}

Order reference: ${order.sumup_checkout_reference}

This is an automated confirmation email. Please do not reply — this mailbox is not monitored.


Best wishes,  
Almond River Records
`.trim();

	try {
		const emailResponse = await resend.emails.send({
			from: "Almond River Records <noreply@orders.almondriverrecords.online>",
			to: order.customer_email,
			subject: "Order Confirmation",
			text,
		});
		console.log("📦 Order confirmation email sent:", emailResponse);
	} catch (error) {
		console.error("❌ Error sending order confirmation email:", error);
	}
}
