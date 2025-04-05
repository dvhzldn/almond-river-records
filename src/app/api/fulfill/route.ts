import { NextResponse } from "next/server";
import { runFulfillment } from "@/lib/runFulfillment";

/**
 * Internal-only endpoint to trigger fulfillment logic from Supabase function
 */
export async function POST(request: Request) {
	try {
		const { checkoutReference }: { checkoutReference?: string } =
			await request.json();

		if (!checkoutReference) {
			return NextResponse.json(
				{ error: "Missing checkoutReference" },
				{ status: 400 }
			);
		}

		console.log("API /api/fulfill: Received request for", checkoutReference);

		await runFulfillment(checkoutReference);

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("API /api/fulfill: Error during fulfillment:", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
