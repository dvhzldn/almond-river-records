import type { NextApiRequest, NextApiResponse } from "next";
import { runFulfillment } from "@/lib/runFulfillment";

/**
 * Internal-only endpoint to trigger fulfillment logic from Supabase function
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Only allow POST requests
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { checkoutReference } = req.body;

	if (!checkoutReference || typeof checkoutReference !== "string") {
		return res
			.status(400)
			.json({ error: "Missing or invalid checkoutReference" });
	}

	try {
		console.log("API /fulfill: Fulfilling", checkoutReference);
		await runFulfillment(checkoutReference);

		return res.status(200).json({ message: "Fulfillment complete" });
	} catch (err) {
		console.error("API /fulfill: Error during fulfillment", err);
		return res.status(500).json({ error: "Fulfillment failed" });
	}
}
