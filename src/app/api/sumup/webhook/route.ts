import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logOrderEvent } from "@/lib/logOrderEvent";
import { runFulfillment } from "@/lib/runFulfillment";

const supabaseService: SupabaseClient = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as {
			event_type: string;
			payload: { reference: string; status: string };
		};

		if (payload.event_type !== "checkout.status.updated") {
			return NextResponse.json(
				{ message: "Ignored event" },
				{ status: 200 }
			);
		}

		const { reference: orderReference, status: checkoutStatus } =
			payload.payload;

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
		if (oldStatus === checkoutStatus) {
			console.log(
				`Webhook: Duplicate status '${checkoutStatus}' – no action taken.`
			);
			return NextResponse.json(
				{ message: "No update needed" },
				{ status: 200 }
			);
		}

		const { error: updateError } = await supabaseService
			.from("orders")
			.update({ sumup_status: checkoutStatus })
			.eq("sumup_checkout_reference", orderReference);

		if (updateError) {
			console.error("Webhook: Error updating status:", updateError);
			return NextResponse.json(
				{ error: "Failed to update" },
				{ status: 500 }
			);
		}

		await logOrderEvent({
			event: "checkout-status-update",
			checkout_reference: orderReference,
			message: `Status updated: ${oldStatus} → ${checkoutStatus}`,
			metadata: { from: oldStatus, to: checkoutStatus },
		});

		if (checkoutStatus === "PAID") {
			try {
				await runFulfillment(orderReference);
			} catch (err) {
				console.error("Webhook: runFulfillment failed:", err);
			}
		}

		return NextResponse.json({ message: "Processed" }, { status: 200 });
	} catch (error: unknown) {
		console.error("Webhook: Unexpected error:", error);
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
