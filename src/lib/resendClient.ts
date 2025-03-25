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

/**
 * Sends an order confirmation email using Resend.
 *
 * @param order - The order details, including customer and shipping information.
 * @param orderItems - Array of order items with record details.
 */
export async function sendOrderConfirmationEmail(
	order: Order,
	orderItems: OrderItem[]
) {
	// Lazy-load the Resend client when needed.
	const { Resend } = await import("resend");
	const resend = new Resend(process.env.RESEND_TRANSACTIONAL_API_KEY!);

	const itemsHtml = orderItems
		.map(
			(item) =>
				`<li>${item.artist_names.join(", ")} – ${item.title} (Price: £${item.price.toFixed(
					2
				)})</li>`
		)
		.join("");

	const shippingAddress = `${order.address1}${
		order.address2 ? ", " + order.address2 : ""
	}${order.address3 ? ", " + order.address3 : ""}, ${order.city}, ${order.postcode}`;

	const htmlContent = `
    <p>Hi ${order.customer_name},</p>
    <p>Thank you for your purchase!</p>
    <p>Your order reference is <strong>${order.sumup_id}</strong>.</p>
    <p>Order Date: ${new Date(order.order_date).toLocaleDateString()}</p>
    <p>Order Details:</p>
    <ul>${itemsHtml}</ul>
    <p>Total Amount: £${order.sumup_amount.toFixed(2)}</p>
    <p>Shipping Address:</p>
    <p>${shippingAddress}</p>
    <p>We will process your order promptly and dispatch within two working days.</p>
    <hr/>
	<p>Best wishes,</p>
	<br>
	<p>Almond River Records</p>
    <div style="text-align:center;">
      <p><img src="https://almondriverrecords.online/images/almond-river-logo.jpg" alt="Almond River Records Logo" style="max-width:200px;" /></p>
    </div>
  `;

	try {
		const emailResponse = await resend.emails.send({
			from: "Almond River Records <noreply@orders.almondriverrecords.online>",
			to: order.customer_email,
			subject: "Order Confirmation",
			html: htmlContent,
		});
		console.log("Order confirmation email sent:", emailResponse);
	} catch (error) {
		console.error("Error sending order confirmation email:", error);
	}
}
