import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
	try {
		// Parse request body
		const body = await req.json();
		const {
			orderDate,
			orderId,
			name,
			email,
			address1,
			address2,
			address3,
			city,
			postcode,
			items,
			orderStatus,
			checkoutId,
			contentfulIds,
		} = body;

		// Decode base64-encoded credentials and parse into JSON
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

		// Append new row to spreadsheet
		await sheets.spreadsheets.values.append({
			spreadsheetId,
			range: "Sheet1!A1",
			valueInputOption: "RAW",
			requestBody: {
				values: [
					[
						orderId,
						orderDate,
						name,
						email,
						address1,
						address2,
						address3,
						city,
						postcode,
						typeof items === "string" ? items : JSON.stringify(items),
						orderStatus,
						checkoutId,
						contentfulIds,
					],
				],
			},
		});

		return NextResponse.json({
			message: "Order data saved successfully",
			orderId,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error processing webhook:", error);
			return NextResponse.json(
				{ error: "Server error", details: error.message },
				{ status: 500 }
			);
		} else {
			console.error("Unexpected error:", error);
			return NextResponse.json(
				{ error: "Server error", details: "An unexpected error occurred." },
				{ status: 500 }
			);
		}
	}
}
