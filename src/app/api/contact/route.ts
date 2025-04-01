import { NextRequest, NextResponse } from "next/server";

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

		const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
		if (!accessKey) {
			console.error("❌ WEB3FORMS_ACCESS_KEY is not set");
			return NextResponse.json(
				{ error: "Server config error" },
				{ status: 500 }
			);
		}

		const payload = {
			access_key: accessKey,
			name: body.full_name,
			email: body.contact_email,
			phone: body.phone_number,
			message: body.user_message,
			from_name: "Almond River Contact Form",
			subject: "New contact form submission",
		};

		const res = await fetch("https://api.web3forms.com/submit", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(payload),
		});

		const result = await res.json();
		if (!result.success) {
			console.error("❌ Web3Forms Error", result);
			return NextResponse.json({ error: "Failed to send" }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("❌ Error handling contact form:", err);
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
