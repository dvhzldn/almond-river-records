export const logClientEvent = async (
	event: string,
	data?: Record<string, unknown>
) => {
	try {
		await fetch("/api/log-event", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ event, data }),
		});
	} catch (err) {
		console.warn("Client logging failed:", err);
	}
};
