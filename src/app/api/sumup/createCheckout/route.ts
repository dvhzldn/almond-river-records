import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { amount, description, recordIds } = body;

		// Ensure recordIds is an array; if it's a string, split it by comma.
		const recordIdsArray = Array.isArray(recordIds)
			? recordIds
			: recordIds.split(",").map((r: string) => r.trim());

		const now = new Date();
		const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
		const uniqueSuffix = now.getTime(); // milliseconds timestamp
		const checkoutReference = `${today}-${recordIdsArray.join("-")}-${uniqueSuffix}`;

		const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
		const merchant_code = process.env.SUMUP_MERCHANT_CODE;

		// const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${orderId}&title=${encodeURIComponent(
		// 	body.title
		// )}&artist=${encodeURIComponent(body.artist)}&coverImage=${encodeURIComponent(body.coverImage)}`;

		const redirectUrl = `https://almond-river-records.vercel.app/payment-success`;

		const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount,
				currency: "GBP",
				checkout_reference: checkoutReference,
				description,
				merchant_code,
				hosted_checkout: { enabled: true },
				redirect_url: redirectUrl,
				return_url: redirectUrl,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return NextResponse.json(
				{ error: "Checkout creation failed", details: errorText },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
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
