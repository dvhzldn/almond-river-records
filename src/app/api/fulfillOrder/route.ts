import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { google } from "googleapis";

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

		// Update inventory
		for (const item of orderItems) {
			await supabaseService
				.from("vinyl_records")
				.update({ quantity: 0 })
				.eq("id", item.vinyl_record_id);
		}
		console.log("fulfillOrder: Inventory updated.");

		// Append row to Google Sheet
		const [orderDatePart, timePart] = order.order_date.split("T");
		const orderTime = timePart.split(".")[0];
		const fullDescription = orderItems
			.map((item) => `${item.artist_names} - ${item.title}`)
			.join("\n");
		const contentfulIds = orderItems
			.map(
				(item) =>
					`https://app.contentful.com/spaces/hvl6gmwk3ce2/entries/${item.vinyl_record_id}`
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
