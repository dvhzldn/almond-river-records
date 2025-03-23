import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "contentful-management";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		// Expect fullDescription from the client, which is the detailed description
		const {
			amount,
			description: fullDescription, // full detailed description for the order
			recordIds,
			orderData, // { name, email, address1, address2, address3, city, postcode }
		} = body;

		// Ensure recordIds is an array.
		const recordIdsArray = Array.isArray(recordIds)
			? recordIds
			: recordIds.split(",").map((r: string) => r.trim());

		// Generate a unique checkout reference.
		const now = new Date();
		const uniqueSuffix = now.getTime();
		const checkoutReference = `${uniqueSuffix}`;

		// Compute a description for SumUp.
		const simpleDescription = `${recordIdsArray.length} x ${recordIdsArray.length === 1 ? "record" : "records"} plus postage.`;

		// SumUp API variables.
		const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
		const merchant_code = process.env.SUMUP_MERCHANT_CODE;
		const redirectUrl = process.env.SUMUP_REDIRECT_URL;

		// Step 1: Create SumUp checkout session using the simple description.
		const sumupResponse = await fetch(
			"https://api.sumup.com/v0.1/checkouts",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount,
					currency: "GBP",
					checkout_reference: checkoutReference,
					description: simpleDescription, // simplified description for payment
					merchant_code,
					hosted_checkout: { enabled: true },
					redirect_url: redirectUrl,
					return_url: redirectUrl,
				}),
			}
		);

		if (!sumupResponse.ok) {
			const errorText = await sumupResponse.text();
			return NextResponse.json(
				{ error: "Checkout creation failed", details: errorText },
				{ status: sumupResponse.status }
			);
		}
		const paymentData = await sumupResponse.json();

		if (
			!paymentData.hosted_checkout_url ||
			!paymentData.id ||
			!paymentData.checkout_reference
		) {
			return NextResponse.json(
				{ error: "Payment not processed. No checkout link available." },
				{ status: 400 }
			);
		}
		const checkoutId = paymentData.id;
		const generatedOrderId = paymentData.checkout_reference;

		// Step 2: Create the order in the Google Sheet using the full description.
		// For the Items field, use the full detailed description.
		const itemsField = fullDescription;

		// Setup Google Sheets credentials.
		const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64!;
		const credentials = JSON.parse(
			Buffer.from(encoded, "base64").toString("utf8")
		);
		const auth = new google.auth.GoogleAuth({
			credentials,
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
		});
		const sheets = google.sheets({ version: "v4", auth });
		const spreadsheetId = process.env.ORDER_SPREADSHEET_ID;
		const orderDate = new Date().toISOString();

		// Append a new row to the spreadsheet.
		await sheets.spreadsheets.values.append({
			spreadsheetId,
			range: "Sheet1!A1",
			valueInputOption: "RAW",
			requestBody: {
				values: [
					[
						generatedOrderId,
						orderDate,
						orderData.name,
						orderData.email,
						orderData.address1,
						orderData.address2,
						orderData.address3,
						orderData.city,
						orderData.postcode,
						itemsField,
						"PENDING",
						checkoutId,
						recordIdsArray.join(","),
					],
				],
			},
		});

		// Step 3: Reserve inventory in Contentful.
		const managementClient = createClient({
			accessToken: process.env
				.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN as string,
		});
		const space = await managementClient.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
		);
		const environment = await space.getEnvironment(
			process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"
		);

		// Update all records concurrently.
		await Promise.all(
			recordIdsArray.map(async (recordId: string) => {
				try {
					let entry = await environment.getEntry(recordId);
					// Reserve the item: set quantity to 0.
					entry.fields.quantity = { "en-GB": 0 };
					entry = await entry.update();
					await entry.publish();
				} catch (err: unknown) {
					console.error(`Error updating record ${recordId}:`, err);
					// Continue processing even if one entry fails.
				}
			})
		);

		// Return the hosted checkout URL and other details.
		return NextResponse.json({
			hosted_checkout_url: paymentData.hosted_checkout_url,
			checkout_reference: generatedOrderId,
			orderDate,
		});
	} catch (err: unknown) {
		console.error("Error processing order:", err);
		return NextResponse.json(
			{
				error: "Server error",
				details: err instanceof Error ? err.message : err,
			},
			{ status: 500 }
		);
	}
}
