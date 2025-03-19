// app/api/sumup/createPaymentLink/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { accessToken, amount, description, orderId } = body;

		// Create a unique checkout reference by combining orderId with current timestamp
		const checkoutReference = `order-${orderId}-${Date.now()}`;

		const payToEmail = process.env.NEXT_PUBLIC_SUMUP_EMAIL_ADDRESS;
		// Send the request to SumUp to create a checkout (payment link)
		const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount, // Make sure this is in the smallest unit (pence for GBP)
				currency: "GBP",
				checkout_reference: checkoutReference,
				description,
				return_url: "http://localhost:3000/payment-success",
				pay_to_email: payToEmail,
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
