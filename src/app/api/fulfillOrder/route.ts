import { NextResponse } from "next/server";
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
	customer_name: string;
	customer_email: string;
	address1: string;
	address2: string;
	address3: string;
	city: string;
	postcode: string;
	order_date: string;
	sumup_status: string;
	order_items: OrderItem[];
}

const supabaseService: SupabaseClient = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function waitForPaidOrder(
	reference: string,
	maxRetries = 5,
	delay = 300
): Promise<Order> {
	for (let i = 0; i < maxRetries; i++) {
		const { data, error } = await supabaseService
			.from("orders")
			.select("*, order_items(*)")
			.eq("sumup_checkout_reference", reference)
			.single<Order>();

		if (error) throw error;
		if (data?.sumup_status === "PAID") return data;

		await new Promise((r) => setTimeout(r, delay));
		console.log(`fulfillOrder: Waiting for PAID status (attempt ${i + 1})`);
	}
	throw new Error("fulfillOrder: Timed out waiting for PAID status.");
}

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

		if (currentQuantity === 0 && currentSold === true) {
			console.log(
				`Contentful: Record ${vinylRecordId} already marked as sold. Skipping update.`
			);
			return;
		}

		entry.fields.quantity = { "en-GB": 0 };
		entry.fields.sold = { "en-GB": true };

		const updated = await entry.update();
		await updated.publish();

		console.log(`Contentful: Record ${vinylRecordId} updated and published.`);
	} catch (err) {
		console.error(`Contentful: Error updating record ${vinylRecordId}`, err);

		if (retries > 0) {
			console.warn(
				`Retrying Contentful update for ${vinylRecordId} (${retries} retries left)...`
			);
			await new Promise((resolve) => setTimeout(resolve, 500));
			return updateContentfulRecord(vinylRecordId, retries - 1);
		}
		console.error(`Contentful: Max retries reached for ${vinylRecordId}.`);
	}
}

export async function POST(request: Request) {
	try {
		const { checkoutReference }: { checkoutReference?: string } =
			await request.json();
		if (!checkoutReference) {
			return NextResponse.json(
				{ error: "Missing checkoutReference" },
				{ status: 400 }
			);
		}

		console.log("fulfillOrder: Starting fulfillment for", checkoutReference);
		const orderData = await waitForPaidOrder(checkoutReference);
		const order = orderData;
		const orderItems = orderData.order_items;

		// 🔁 Check if fulfillment already logged
		const { data: recentLogs, error: logsError } = await supabaseService
			.from("order_logs")
			.select("*")
			.eq("checkout_reference", checkoutReference)
			.eq("event", "order-fulfilled")
			.order("created_at", { ascending: false })
			.limit(1);

		if (logsError) {
			console.warn(
				"fulfillOrder: Unable to fetch previous logs:",
				logsError
			);
		}

		if (Array.isArray(recentLogs) && recentLogs.length > 0) {
			console.log(
				"fulfillOrder: Fulfillment already logged — skipping log."
			);
		} else {
			// ⬇️ Perform fulfillment
			for (const item of orderItems) {
				await supabaseService
					.from("vinyl_records")
					.update({ quantity: 0, sold: true })
					.eq("id", item.vinyl_record_id);

				await updateContentfulRecord(item.vinyl_record_id);
			}

			console.log("fulfillOrder: Inventory updated.");

			// ⬇️ Append to Google Sheets
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
				requestBody: {
					values: [rowData],
				},
			});
			console.log("fulfillOrder: Row added to Google Sheet.");

			await logOrderEvent({
				event: "order-fulfilled",
				checkout_reference: checkoutReference,
				message:
					"Order fulfilled: inventory + Contentful + Google Sheets updated.",
				metadata: {
					items: orderItems.map((i) => i.vinyl_record_id),
				},
			});
		}

		return NextResponse.json(
			{ message: "Fulfillment complete." },
			{ status: 200 }
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(
				"fulfillOrder: Error during fulfillment:",
				error.message
			);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		console.error("fulfillOrder: Unknown error:", error);
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
