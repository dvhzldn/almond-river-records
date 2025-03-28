import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";
import type { SupabaseClient } from "@supabase/supabase-js";

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

const supabaseService: SupabaseClient = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as {
			event_type: string;
			payload: {
				reference: string;
				status: string;
			};
		};

		console.log("Webhook: Received payload:", payload);

		if (payload.event_type === "checkout.status.updated") {
			const checkoutDetails = payload.payload;
			const orderReference = checkoutDetails.reference;
			const checkoutStatus = checkoutDetails.status;

			if (checkoutStatus === "PAID") {
				// 1. Update order status
				const { error: updateError } = await supabaseService
					.from("orders")
					.update({ sumup_status: "PAID" })
					.eq("sumup_checkout_reference", orderReference);

				if (updateError) {
					console.error(
						"Webhook: Error updating order status:",
						updateError
					);
					return NextResponse.json(
						{ error: "Failed to update status" },
						{ status: 500 }
					);
				}

				// 2. Fetch order with items
				const { data: orderData, error: fetchError } = await supabaseService
					.from("orders")
					.select("*, order_items(*)")
					.eq("sumup_checkout_reference", orderReference)
					.single<Order>();

				if (fetchError || !orderData) {
					console.error(
						"Webhook: Failed to fetch order for email:",
						fetchError
					);
				} else if (!orderData.order_confirmation_email_sent) {
					await supabaseService
						.from("orders")
						.update({ order_confirmation_email_sent: true })
						.eq("sumup_checkout_reference", orderReference);

					await sendOrderConfirmationEmail(
						orderData,
						orderData.order_items
					);
					console.log("Webhook: Confirmation email sent.");
				}

				// 3. Trigger fulfillment (fire-and-forget)
				fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fulfillOrder`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ checkoutReference: orderReference }),
				}).catch((err) =>
					console.error("Webhook: Error triggering fulfillment:", err)
				);
			} else {
				const status = checkoutStatus === "FAILED" ? "FAILED" : "PENDING";
				await supabaseService
					.from("orders")
					.update({ sumup_status: status })
					.eq("sumup_checkout_reference", orderReference);
			}
		}

		return NextResponse.json({}, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Webhook: Unexpected error:", error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		console.error("Webhook: Unknown error:", error);
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
