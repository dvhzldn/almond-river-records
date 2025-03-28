import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";
import type { SupabaseClient } from "@supabase/supabase-js";
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

		if (payload.event_type !== "checkout.status.updated") {
			return NextResponse.json(
				{ message: "Ignored event" },
				{ status: 200 }
			);
		}

		const checkoutDetails = payload.payload;
		const orderReference = checkoutDetails.reference;
		const checkoutStatus = checkoutDetails.status;

		// 🔍 Step 1: Fetch existing order to compare status
		const { data: existingOrder, error: fetchError } = await supabaseService
			.from("orders")
			.select("sumup_status, order_confirmation_email_sent")
			.eq("sumup_checkout_reference", orderReference)
			.single();

		if (fetchError || !existingOrder) {
			console.error(
				"Webhook: Could not find order for diff check:",
				fetchError
			);
			return NextResponse.json(
				{ error: "Order not found" },
				{ status: 404 }
			);
		}

		const oldStatus = existingOrder.sumup_status;

		// 🧠 Step 2: Only continue if the status has changed
		if (oldStatus === checkoutStatus) {
			console.log(
				`Webhook: Duplicate status '${checkoutStatus}' received – no action taken.`
			);
			return NextResponse.json(
				{ message: "Duplicate status – no update" },
				{ status: 200 }
			);
		}

		// ✅ Step 3: Update Supabase
		const { error: updateError } = await supabaseService
			.from("orders")
			.update({ sumup_status: checkoutStatus })
			.eq("sumup_checkout_reference", orderReference);

		if (updateError) {
			console.error("Webhook: Error updating order status:", updateError);
			return NextResponse.json(
				{ error: "Failed to update status" },
				{ status: 500 }
			);
		}

		// 🪵 Step 4: Log the change
		await logOrderEvent({
			event: "checkout-status-update",
			checkout_reference: orderReference,
			message: `Checkout status updated from ${oldStatus} → ${checkoutStatus}`,
			metadata: { from: oldStatus, to: checkoutStatus },
		});

		// 🎯 Step 5: If status is PAID, continue workflow
		if (checkoutStatus === "PAID") {
			// Fetch full order for email sending
			const { data: orderData, error: orderFetchError } =
				await supabaseService
					.from("orders")
					.select("*, order_items(*)")
					.eq("sumup_checkout_reference", orderReference)
					.single<Order>();

			if (orderFetchError || !orderData) {
				console.error(
					"Webhook: Could not fetch full order:",
					orderFetchError
				);
			} else if (!orderData.order_confirmation_email_sent) {
				await supabaseService
					.from("orders")
					.update({ order_confirmation_email_sent: true })
					.eq("sumup_checkout_reference", orderReference);

				await sendOrderConfirmationEmail(orderData, orderData.order_items);
				console.log("Webhook: Confirmation email sent.");

				await logOrderEvent({
					event: "email-sent",
					checkout_reference: orderReference,
					message: "Order confirmation email sent.",
				});
			}

			// Trigger fulfillment (fire-and-forget)
			fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fulfillOrder`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ checkoutReference: orderReference }),
			}).catch((err) =>
				console.error("Webhook: Error triggering fulfillment:", err)
			);

			await logOrderEvent({
				event: "fulfillment-triggered",
				checkout_reference: orderReference,
				message: "Fulfillment triggered after payment confirmation.",
			});
		}

		return NextResponse.json(
			{ message: "Status processed" },
			{ status: 200 }
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Webhook: Unexpected error:", error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		console.error("Webhook: Unknown error:", error);
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
