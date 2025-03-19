// app/api/sumup/createCheckout/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { accessToken, amount } = body;
		const checkoutReference = `order-123-${Date.now()}`;

		const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount,
				currency: "GBP", // or your preferred currency
				checkout_reference: checkoutReference,
				description: "Test Payment",
				return_url: "http://localhost:3000/payment-success",
				pay_to_email: "davehazeldean@gmail.com",
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
