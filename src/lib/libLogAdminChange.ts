import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function logAdminChange({
	recordId,
	field,
	oldValue,
	newValue,
	adminEmail,
	ipAddress,
	route,
}: {
	recordId: string;
	field: string;
	oldValue: string | null;
	newValue: string;
	adminEmail: string;
	ipAddress: string;
	route: string;
}) {
	const { error } = await supabaseAdmin.from("admin_changes").insert({
		record_id: recordId,
		field,
		old_value: oldValue,
		new_value: newValue,
		admin_email: adminEmail,
		ip_address: ipAddress,
		route,
	});

	if (error) {
		console.error("Failed to log admin change:", error);
	}

	return { success: true };
}

export async function isRateLimited(
	ipAddress: string,
	field: string
): Promise<boolean> {
	const { count, error } = await supabaseAdmin
		.from("admin_changes")
		.select("id", { count: "exact", head: true })
		.eq("ip_address", ipAddress)
		.eq("field", field)
		.gte("changed_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

	if (error) {
		console.error("Rate limit check failed:", error);
		return true;
	}

	return (count ?? 0) >= 5;
}
