import { createClient } from "@supabase/supabase-js";

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
	const { error } = await supabase
		.from("order_logs")
		.insert([{ event, checkout_reference, message, metadata }]);

	if (error) {
		console.error("⚠️ Failed to log order event:", error);
	}
}
