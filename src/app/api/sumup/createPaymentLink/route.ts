// app/api/sumup/createPaymentLink/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { amount, description, orderId } = body;
		const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
		const merchant_code = process.env.SUMUP_MERCHANT_CODE;

		const checkoutReference = `order-${orderId}-${Date.now()}`;

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
				return_url: "http://localhost:3000/payment-success",
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return NextResponse.json(
				{ error: "Payment link creation failed", details: errorText },
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
