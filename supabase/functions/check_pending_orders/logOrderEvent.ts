// A simplified version for Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5?dts";

const supabase = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface LogOrderEventArgs {
	event: string;
	checkout_reference: string;
	message: string;
	metadata?: Record<string, unknown>;
}

export async function logOrderEvent({
	event,
	checkout_reference,
	message,
	metadata = {},
}: LogOrderEventArgs): Promise<void> {
	await supabase.from("order_logs").insert([
		{
			event,
			checkout_reference,
			message,
			metadata,
		},
	]);
}
