import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "contentful-management";

// Helper function to update order status in Google Sheets
async function updateOrderStatus(orderId: string, status: string) {
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

	// Get rows from the sheet (range A:R)
	const getResponse = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: "Sheet1!A:R",
	});

	const rows = getResponse.data.values;
	if (!rows || rows.length === 0) {
		throw new Error("No data found in the spreadsheet.");
	}

	// Find the row where the first column (orderId) matches the given orderId.
	let rowNumber: number | null = null;
	for (let i = 0; i < rows.length; i++) {
		if (rows[i][0] === orderId) {
			rowNumber = i + 1; // Row numbers are 1-indexed in Sheets.
			break;
		}
	}

	if (!rowNumber) {
		throw new Error(`Order ${orderId} not found in the spreadsheet.`);
	}

	// Update the Payment Status, assuming it is in Column K.
	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: `Sheet1!K${rowNumber}`,
		valueInputOption: "RAW",
		requestBody: {
			values: [[status]],
		},
	});

	console.log(
		`Updated order ${orderId} status to ${status} in row ${rowNumber}.`
	);
}

// Helper function to release inventory for given record IDs.
async function releaseInventory(recordIds: string[]) {
	const managementClient = createClient({
		accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN as string,
	});
	const space = await managementClient.getSpace(
		process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
	);
	const environment = await space.getEnvironment(
		process.env.CONTENTFUL_ENVIRONMENT || "master"
	);

	await Promise.all(
		recordIds.map(async (recordId: string) => {
			try {
				let entry = await environment.getEntry(recordId);
				entry.fields.quantity = { "en-GB": 1 };
				entry.fields.inStock = { "en-GB": true };

				entry = await entry.update();
				await entry.publish();

				console.log(`Released inventory for record ${recordId}`);
			} catch (err: unknown) {
				if (err instanceof Error) {
					console.error(
						`Error releasing inventory for record ${recordId}:`,
						err
					);
				} else {
					console.error(
						`Unknown error releasing inventory for record ${recordId}`
					);
				}
			}
		})
	);
}

// Helper function to retrieve record IDs from the order's Items column in Google Sheets.
// This function assumes:
// - Column A contains the orderId.
// - Column J contains a comma-separated list of record IDs.
async function getOrderItems(orderId: string): Promise<string[]> {
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

	const getResponse = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: "Sheet1!A:Z",
	});

	const rows = getResponse.data.values;
	if (!rows || rows.length === 0) {
		throw new Error("No data found in the spreadsheet.");
	}

	let rowNumber: number | null = null;
	let itemsValue: string | null = null;
	for (let i = 0; i < rows.length; i++) {
		if (rows[i][0] === orderId) {
			rowNumber = i + 1;
			// Contentful Item IDs are stored in Column M (index 12)
			itemsValue = rows[i][12];
			break;
		}
	}

	if (!rowNumber || !itemsValue) {
		throw new Error(`Order ${orderId} not found or Items column is empty.`);
	}

	// Split the comma-separated record IDs and return them.
	const recordIds = itemsValue
		.split(",")
		.map((id: string) => id.trim())
		.filter(Boolean);
	return recordIds;
}

export async function POST(request: Request) {
	try {
		// Parse incoming webhook payload
		const payload = await request.json();
		console.log("Received webhook payload:", payload);

		// Inside your webhook POST handler, before calling SumUp:
		if (payload.id === "simulate-failed") {
			// Create a dummy checkoutDetails object that simulates a FAILED status.
			const checkoutDetails = {
				checkout_reference: "TEST-ORDER-FAILED",
				status: "FAILED",
			};
			console.log("Simulated checkout details:", checkoutDetails);

			// Proceed with updating the order status and releasing inventory.
			await updateOrderStatus(checkoutDetails.checkout_reference, "FAILED");
			// Retrieve record IDs from the Google Sheet and release inventory.
			const recordIds = await getOrderItems(
				checkoutDetails.checkout_reference
			);
			await releaseInventory(recordIds);

			return NextResponse.json({}, { status: 200 });
		}

		// Check for the expected event type
		if (payload.event_type === "checkout.status.updated") {
			// In the new payload, details are nested inside "payload"
			const checkoutDetails = payload.payload;
			console.log("Verified checkout details:", checkoutDetails);

			const orderId: string = checkoutDetails.reference;
			const checkoutStatus: string = checkoutDetails.status;

			if (
				checkoutStatus === "PAID" ||
				checkoutStatus === "succeeded" ||
				checkoutStatus === "COMPLETED"
			) {
				await updateOrderStatus(orderId, "PAID");
			} else if (checkoutStatus === "FAILED") {
				await updateOrderStatus(orderId, "FAILED");
				const recordIds = await getOrderItems(orderId);
				await releaseInventory(recordIds);
			} else {
				await updateOrderStatus(orderId, "PENDING");
			}
		}

		// Return an empty 200 response as required by SumUp
		return NextResponse.json({}, { status: 200 });
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
