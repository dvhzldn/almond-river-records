// lib/runFulfillment.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { contentfulManagementClient } from "@/lib/contentfulManagementClient";
import { logOrderEvent } from "@/lib/logOrderEvent";
import { sendOrderConfirmation } from "@/lib/sendOrderConfirmation";

// Represents a single item in the order
interface OrderItem {
	vinyl_record_id: string;
	artist_names: string[];
	title: string;
	price: number;
}

// Represents the full order fetched from Supabase
interface Order {
	id: string;
	customer_name: string;
	customer_email: string;
	address1: string;
	address2: string;
	address3: string;
	city: string;
	postcode: string;
	order_date: string;
	sumup_status: string;
	sumup_checkout_reference: string;
	sumup_id: string;
	sumup_amount: number;
	order_confirmation_email_sent: boolean;
	order_items: OrderItem[];
	fulfilled_at: string | null; // ✅ used as fulfillment guard
}

// Supabase service role client (server-side only)
const supabaseService: SupabaseClient = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Marks a vinyl record as sold in Contentful.
 * Retries with exponential backoff if needed.
 */
async function updateContentfulRecord(
	vinylRecordId: string,
	retries = 5,
	delayMs = 500
): Promise<void> {
	try {
		const space = await contentfulManagementClient.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!
		);
		const environment = await space.getEnvironment(
			process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"
		);
		const entry = await environment.getEntry(vinylRecordId);

		const currentQuantity = entry.fields.quantity?.["en-GB"];
		const currentSold = entry.fields.sold?.["en-GB"];

		// Skip if already sold
		if (currentQuantity === 0 && currentSold === true) return;

		entry.fields.quantity = { "en-GB": 0 };
		entry.fields.sold = { "en-GB": true };

		const updated = await entry.update();
		await updated.publish();

		console.log(`Contentful: Record ${vinylRecordId} updated and published.`);
	} catch {
		console.warn(
			`Contentful: Error updating ${vinylRecordId}. Retries left: ${retries - 1}`
		);
		if (retries > 0) {
			await new Promise((r) => setTimeout(r, delayMs));
			return updateContentfulRecord(vinylRecordId, retries - 1, delayMs * 2);
		}
		console.error(`Contentful: Max retries reached for ${vinylRecordId}`);
		throw new Error(`Failed to update Contentful record ${vinylRecordId}`);
	}
}

/**
 * Fulfills an order: verifies status, updates stock, sends email,
 * logs to Google Sheets, and writes fulfillment log and timestamp.
 */
export async function runFulfillment(checkoutReference: string): Promise<void> {
	console.log("runFulfillment: Starting for", checkoutReference);

	const MAX_RETRIES = 6;
	const INITIAL_DELAY = 500;
	let order: Order | null = null;

	// 1. Fetch the order and confirm it's marked as PAID
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		const { data, error } = await supabaseService
			.from("orders")
			.select("*, order_items(*)")
			.eq("sumup_checkout_reference", checkoutReference)
			.single<Order>();

		if (error || !data) {
			console.error(
				`runFulfillment: Supabase fetch failed (attempt ${attempt})`,
				error
			);
			throw new Error("runFulfillment: Failed to fetch order");
		}

		if (data.sumup_status === "PAID") {
			order = data;
			break;
		}

		const wait = INITIAL_DELAY * attempt;
		console.log(
			`runFulfillment: Waiting for PAID status (attempt ${attempt}) — retrying in ${wait}ms`
		);
		await new Promise((r) => setTimeout(r, wait));
	}

	if (!order) throw new Error("runFulfillment: No order retrieved.");
	if (order.sumup_status !== "PAID") {
		throw new Error("runFulfillment: Order is not marked as PAID");
	}

	// 2. Idempotency guard: skip if already fulfilled
	if (order.fulfilled_at) {
		console.log("runFulfillment: Order already fulfilled — skipping.");
		return;
	}

	const orderItems = order.order_items;
	console.log("runFulfillment: Proceeding with fulfillment.");

	// 3. Send confirmation email
	await sendOrderConfirmation(supabaseService, order, orderItems);
	console.log("runFulfillment: Confirmation email sent.");

	// 4. Mark items as sold in Supabase and Contentful
	for (const item of orderItems) {
		await supabaseService
			.from("vinyl_records")
			.update({ quantity: 0, sold: true })
			.eq("id", item.vinyl_record_id);

		console.log(`Supabase: Record ${item.vinyl_record_id} marked as sold.`);

		await updateContentfulRecord(item.vinyl_record_id);
	}

	console.log("runFulfillment: Inventory and Contentful updates complete.");

	// 5. Prepare row data for Google Sheet
	const [orderDatePart, timePart] = order.order_date.split("T");
	const orderTime = timePart.split(".")[0];
	const fullDescription = orderItems
		.map((item) => `${item.artist_names} - ${item.title}`)
		.join("\n");
	const contentfulIds = orderItems
		.map(
			(item) =>
				`https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries/${item.vinyl_record_id}`
		)
		.join("\n");

	const rowData = [
		orderDatePart,
		orderTime,
		order.sumup_status,
		order.customer_name,
		order.customer_email,
		order.address1,
		order.address2,
		order.address3,
		order.city,
		order.postcode,
		fullDescription,
		contentfulIds,
		checkoutReference,
	];

	// 6. Append to Google Sheet if not already logged
	const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64!;
	const credentials = JSON.parse(
		Buffer.from(encoded, "base64").toString("utf8")
	);
	const auth = new google.auth.GoogleAuth({
		credentials,
		scopes: ["https://www.googleapis.com/auth/spreadsheets"],
	});
	const sheets = google.sheets({ version: "v4", auth });
	const spreadsheetId = process.env.ORDER_SPREADSHEET_ID!;
	const sheetRange = "Sheet1!A1:Z1000";

	const existingRowsRes = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: sheetRange,
	});
	const existingRows = existingRowsRes.data.values || [];
	const checkoutColumnIndex = 12;

	const alreadyLogged = existingRows.some(
		(row) => row[checkoutColumnIndex] === checkoutReference
	);

	if (!alreadyLogged) {
		await sheets.spreadsheets.values.append({
			spreadsheetId,
			range: "Sheet1!A1",
			valueInputOption: "RAW",
			requestBody: { values: [rowData] },
		});
		console.log("runFulfillment: Row added to Google Sheet.");
	} else {
		console.log("runFulfillment: Row already exists in Google Sheet.");
	}

	// 7. Log fulfillment event to order_logs for observability
	await logOrderEvent({
		event: "order-fulfilled",
		checkout_reference: checkoutReference,
		message: "Order fulfilled: inventory + Contentful + Sheets updated",
		metadata: {
			item_ids: orderItems.map((i) => i.vinyl_record_id),
			order_id: order.id,
			amount: order.sumup_amount,
		},
	});

	// 8. Update fulfilled_at to permanently mark as fulfilled
	await supabaseService
		.from("orders")
		.update({ fulfilled_at: new Date().toISOString() })
		.eq("id", order.id);

	console.log(
		"runFulfillment: Fulfillment complete and marked with fulfilled_at."
	);
}
