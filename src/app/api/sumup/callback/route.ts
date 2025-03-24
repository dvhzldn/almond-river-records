import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");

	if (!code) {
		return NextResponse.json(
			{ error: "Missing authorization code" },
			{ status: 400 }
		);
	}

	const clientId = process.env.NEXT_PUBLIC_SUMUP_CLIENT_ID;
	const clientSecret = process.env.SUMUP_CLIENT_SECRET;
	const redirectUri = process.env.NEXT_PUBLIC_SUMUP_REDIRECT_URI;

	try {
		// Exchange the authorization code for an access token
		const tokenResponse = await fetch("https://api.sumup.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code,
				client_id: clientId!,
				client_secret: clientSecret!,
				redirect_uri: redirectUri!,
			}),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			return NextResponse.json(
				{ error: "Token exchange failed", details: errorText },
				{ status: tokenResponse.status }
			);
		}

		const tokenData = await tokenResponse.json();

		// tokenData now includes an access_token field among others
		return NextResponse.json(tokenData, { status: 200 });
	} catch (err) {
		return NextResponse.json(
			{
				error: "Server error",
				details: err instanceof Error ? err.message : err,
			},
			{ status: 500 }
		);
	}
}
