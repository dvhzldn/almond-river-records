// lib/runFulfillment.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { contentfulManagementClient } from "@/lib/contentfulManagementClient";
import { logOrderEvent } from "@/lib/logOrderEvent";

interface OrderItem {
	vinyl_record_id: string;
	artist_names: string[];
	title: string;
	price: number;
}

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
}

const supabaseService: SupabaseClient = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateContentfulRecord(
	vinylRecordId: string,
	retries = 3
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

		if (currentQuantity === 0 && currentSold === true) return;

		entry.fields.quantity = { "en-GB": 0 };
		entry.fields.sold = { "en-GB": true };

		const updated = await entry.update();
		await updated.publish();
	} catch {
		if (retries > 0) {
			await new Promise((r) => setTimeout(r, 500));
			return updateContentfulRecord(vinylRecordId, retries - 1);
		}
		throw new Error(`Failed to update Contentful record ${vinylRecordId}`);
	}
}

export async function runFulfillment(checkoutReference: string): Promise<void> {
	const { data: orderData, error } = await supabaseService
		.from("orders")
		.select("*, order_items(*)")
		.eq("sumup_checkout_reference", checkoutReference)
		.single<Order>();

	if (error || !orderData) {
		throw new Error("runFulfillment: Failed to fetch order");
	}

	const order = orderData;
	const orderItems = orderData.order_items;

	if (order.sumup_status !== "PAID") {
		throw new Error("runFulfillment: Order is not marked as PAID");
	}

	// Update inventory in Supabase + Contentful
	for (const item of orderItems) {
		await supabaseService
			.from("vinyl_records")
			.update({ quantity: 0, sold: true })
			.eq("id", item.vinyl_record_id);
		await updateContentfulRecord(item.vinyl_record_id);
	}

	// Append to Google Sheets
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

	await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: "Sheet1!A1",
		valueInputOption: "RAW",
		requestBody: { values: [rowData] },
	});

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
}
