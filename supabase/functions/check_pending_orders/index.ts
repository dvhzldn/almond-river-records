// supabase/functions/check_pending_orders/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5?dts";
import { logOrderEvent } from "./logOrderEvent.ts";

interface ScheduledOrder {
	id: string;
	sumup_id: string;
	sumup_checkout_reference: string;
	sumup_status: string;
	fulfillment_retry_attempts: number;
	last_fulfillment_attempt_at: string | null;
}

interface SumUpCheckoutResponse {
	status: string;
}

const supabase = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const MAX_RETRIES = 5;
const BACKOFF_MINUTES = 10;

export default async function handler(_req: Request): Promise<Response> {
	const now = new Date();
	const backoffCutoff = new Date(
		now.getTime() - BACKOFF_MINUTES * 60 * 1000
	).toISOString();

	const { data: orders, error } = (await supabase
		.from("orders")
		.select(
			"id, sumup_id, sumup_checkout_reference, sumup_status, fulfillment_retry_attempts, last_fulfillment_attempt_at"
		)
		.eq("sumup_status", "PENDING")
		.lt("fulfillment_retry_attempts", MAX_RETRIES)
		.or(
			`last_fulfillment_attempt_at.is.null,last_fulfillment_attempt_at.lt.${backoffCutoff}`
		)) as { data: ScheduledOrder[] | null; error: Error | null };

	if (error) {
		console.error("Scheduled check error:", error);
		return new Response("Error during scheduled check", { status: 500 });
	}

	for (const order of orders ?? []) {
		const checkoutId = order.sumup_checkout_reference;

		try {
			const sumupRes = await fetch(
				`https://api.sumup.com/v0.1/checkouts/${order.sumup_id}`,
				{
					headers: {
						Authorization: `Bearer ${Deno.env.get("SUMUP_DEVELOPMENT_API_KEY")}`,
					},
				}
			);

			if (!sumupRes.ok) {
				throw new Error(
					`Failed to fetch SumUp checkout status (${sumupRes.status})`
				);
			}

			const sumupData: SumUpCheckoutResponse = await sumupRes.json();

			if (sumupData.status !== "PAID") {
				await logOrderEvent({
					event: "scheduled-check",
					checkout_reference: checkoutId,
					message: `Still not paid (SumUp status: ${sumupData.status})`,
					metadata: { status: sumupData.status },
				});
				continue;
			}

			// Update to PAID
			await supabase
				.from("orders")
				.update({ sumup_status: "PAID" })
				.eq("id", order.id);

			await logOrderEvent({
				event: "checkout-status-update",
				checkout_reference: checkoutId,
				message: "Status manually updated to PAID via scheduled function",
			});

			// Trigger fulfillment
			const fulfillRes = await fetch(
				`${Deno.env.get("NEXT_PUBLIC_BASE_URL")}/api/fulfillOrder`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ checkoutReference: checkoutId }),
				}
			);

			if (!fulfillRes.ok) {
				const text = await fulfillRes.text();
				throw new Error(`Fulfillment failed: ${text}`);
			}

			await logOrderEvent({
				event: "fulfillment-triggered",
				checkout_reference: checkoutId,
				message: "Fulfillment triggered by scheduled job.",
			});

			await supabase
				.from("orders")
				.update({
					fulfillment_retry_attempts: 0,
					last_fulfillment_attempt_at: new Date().toISOString(),
				})
				.eq("id", order.id);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error occurred";

			console.error("Retry error:", checkoutId, errorMessage);

			await logOrderEvent({
				event: "fulfillment-retry-failed",
				checkout_reference: checkoutId,
				message: `Scheduled retry failed: ${errorMessage}`,
			});

			await supabase
				.from("orders")
				.update({
					fulfillment_retry_attempts: order.fulfillment_retry_attempts + 1,
					last_fulfillment_attempt_at: new Date().toISOString(),
				})
				.eq("id", order.id);
		}
	}

	return new Response("Scheduled function executed", { status: 200 });
}
