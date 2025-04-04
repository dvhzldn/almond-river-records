import { createClient } from "@supabase/supabase-js";
import { logEvent } from "@/lib/logger";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logOrderEvent({
	event,
	checkout_reference,
	message,
	metadata = {},
}: {
	event: string;
	checkout_reference: string;
	message: string;
	metadata?: Record<string, unknown>;
}) {
	const payload = {
		event,
		checkout_reference,
		message,
		...metadata,
	};

	try {
		await logEvent(event, payload);
	} catch (err) {
		console.warn("⚠️ Axiom logging failed:", err);
	}

	const { error } = await supabase
		.from("order_logs")
		.insert([{ event, checkout_reference, message, metadata }]);

	if (error) {
		console.error("⚠️ Failed to log order event to Supabase:", error);
	}
}
