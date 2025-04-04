import { NextResponse } from "next/server";
import { logEvent } from "@/lib/logger";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { event, data } = body;

		if (!event || typeof event !== "string") {
			return NextResponse.json(
				{ error: "Missing or invalid 'event'" },
				{ status: 400 }
			);
		}

		await logEvent(event, {
			...data,
			source: "client",
		});

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Client log event failed:", err);
		return NextResponse.json(
			{ error: "Failed to log event" },
			{ status: 500 }
		);
	}
}
