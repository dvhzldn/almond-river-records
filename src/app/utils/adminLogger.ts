// utils/adminLogger.ts
import { supabase } from "@/lib/supabaseClient";

interface AdminChangeOptions {
	recordId: string;
	field: string;
	oldValue?: string;
	newValue?: string;
	adminEmail: string;
	ipAddress: string;
	route: string;
}

export async function logAdminChange({
	recordId,
	field,
	oldValue,
	newValue,
	adminEmail,
	ipAddress,
	route,
}: AdminChangeOptions): Promise<void> {
	const { error } = await supabase.from("admin_changes").insert({
		record_id: recordId,
		field,
		old_value: oldValue,
		new_value: newValue,
		admin_email: adminEmail,
		ip_address: ipAddress,
		route,
	});

	if (error) {
		console.error("❌ Failed to log admin change:", error);
	}
}

export async function isRateLimited({
	ipAddress,
	field,
	maxChanges = 3,
	windowMinutes = 5,
}: {
	ipAddress: string;
	field: string;
	maxChanges?: number;
	windowMinutes?: number;
}): Promise<boolean> {
	const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

	const { data, error } = await supabase
		.from("admin_changes")
		.select("id", { count: "exact" })
		.eq("ip_address", ipAddress)
		.eq("field", field)
		.gte("changed_at", since);

	if (error) {
		console.error("❌ Failed to check rate limit:", error);
		return false;
	}

	return (data?.length ?? 0) >= maxChanges;
}
