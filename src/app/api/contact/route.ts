import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/resendContactEmail";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Honeypot check
		if (body.website) {
			console.warn("🕵️ Honeypot triggered");
			return NextResponse.json({ success: true });
		}

		// CSRF check
		const token = body.csrf_token;
		const localToken = body.csrf_token;
		if (!token || token !== localToken) {
			console.warn("🚨 CSRF token mismatch");
			return NextResponse.json({ error: "Invalid token" }, { status: 400 });
		}

		const contactData = {
			full_name: body.full_name,
			contact_email: body.contact_email,
			phone_number: body.phone_number,
			user_message: body.user_message,
		};

		await sendContactEmail(contactData);

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("❌ Error handling contact form:", err);
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
