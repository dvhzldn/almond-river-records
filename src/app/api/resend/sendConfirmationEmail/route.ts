// api/sendConfirmationEmail/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
	try {
		const { checkoutId } = await request.json();
		if (!checkoutId) {
			return NextResponse.json(
				{ error: "Missing checkoutId" },
				{ status: 400 }
			);
		}

		// Fetch the order by checkout reference
		const { data: order, error: orderError } = await supabaseService
			.from("orders")
			.select("*")
			.eq("sumup_checkout_reference", checkoutId)
			.single();

		if (orderError || !order) {
			return NextResponse.json(
				{ error: "Order not found" },
				{ status: 404 }
			);
		}

		// Check if email was already sent
		if (order.order_confirmation_email_sent) {
			return NextResponse.json({ message: "Email already sent" });
		}

		// Fetch order items
		const { data: orderItems, error: orderItemsError } = await supabaseService
			.from("order_items")
			.select("*")
			.eq("order_id", order.id);

		if (orderItemsError || !orderItems) {
			return NextResponse.json(
				{ error: "Order items not found" },
				{ status: 404 }
			);
		}

		// Send the confirmation email
		await sendOrderConfirmationEmail(order, orderItems);

		// Update the order so that email_sent is true
		await supabaseService
			.from("orders")
			.update({ order_confirmation_email_sent: true })
			.eq("sumup_checkout_reference", checkoutId);

		return NextResponse.json({ message: "Email sent successfully" });
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: "Server error",
				details: error instanceof Error ? error.message : error,
			},
			{ status: 500 }
		);
	}
}
