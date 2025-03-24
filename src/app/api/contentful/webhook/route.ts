import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

interface ContentfulWebhookFields {
	[key: string]: {
		"en-GB": unknown;
	};
}

interface ContentfulWebhookPayload {
	sys: {
		id: string;
		type: string;
		createdAt?: string;
		updatedAt?: string;
		contentType?: {
			sys: {
				id: string;
			};
		};
	};
	fields: ContentfulWebhookFields;
}

interface AssetFileData {
	url: string;
	details: {
		size: number;
		image?: {
			width: number;
			height: number;
		};
	};
	fileName: string;
	contentType: string;
}

// Set the webhook secret from environment variables
const CONTENTFUL_WEBHOOK_SECRET = process.env.CONTENTFUL_WEBHOOK_SECRET!;

// Utility function to validate webhook signature
const validateWebhookSignature = async (req: Request, rawBody: string) => {
	const signature = req.headers.get("X-Contentful-Webhook-Signature");
	const computedSignature = crypto
		.createHmac("sha256", CONTENTFUL_WEBHOOK_SECRET)
		.update(rawBody) // Using the raw body to compute the signature
		.digest("hex");

	return signature === computedSignature;
};

export async function POST(request: Request) {
	try {
		// Read the request body once
		const rawBody = await request.text();
		console.log("Webhook payload:", rawBody);

		// Parse the payload to a JavaScript object
		const payload = JSON.parse(rawBody) as ContentfulWebhookPayload;

		// Validate the webhook signature
		const isValid = await validateWebhookSignature(request, rawBody);
		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid webhook signature" },
				{ status: 403 }
			);
		}

		if (!payload.fields) {
			throw new Error("Payload is missing the 'fields' property");
		}

		const { sys, fields } = payload;
		const recordId = sys.id;

		// If the payload is for an Asset, upsert into contentful_assets.
		if (sys.type === "Asset") {
			// Extract asset fields.
			const title = fields.title ? (fields.title["en-GB"] as string) : null;
			const fileData = fields.file
				? (fields.file["en-GB"] as AssetFileData)
				: null;
			let url = fileData?.url || "";
			if (url && url.startsWith("//")) {
				url = "https:" + url;
			}
			// Replace the domain to use images.ctfassets.net instead of images.contentful.com.
			if (url && url.includes("images.contentful.com")) {
				url = url.replace("images.contentful.com", "images.ctfassets.net");
			}
			const file_name = fileData?.fileName || null;
			const content_type = fileData?.contentType || null;
			const details = fileData?.details || null;
			const created_at = sys.createdAt;
			const updated_at = sys.updatedAt;

			const assetData = {
				id: recordId,
				title,
				url,
				details,
				file_name,
				content_type,
				created_at,
				updated_at,
			};

			const { error } = await supabase
				.from("contentful_assets")
				.upsert(assetData, { onConflict: "id" });
			if (error) {
				console.error("Error upserting asset:", error);
				return NextResponse.json(
					{ error: "Error upserting asset" },
					{ status: 500 }
				);
			}
			return NextResponse.json({ message: "Asset synced successfully" });
		}

		// Otherwise, if the payload is an Entry, assume it is a vinyl record.
		if (sys.type === "Entry") {
			// Extract fields for vinyl_records.
			const title = (fields.title?.["en-GB"] as string) || null;
			const sub_title = fields.subTitle
				? (fields.subTitle["en-GB"] as string)
				: null;
			const artist_names = (fields.artistName?.["en-GB"] as string[]) || [];
			// Compute a text version for searching.
			const artist_names_text = artist_names.join(" ");

			// For assets referenced in the entry, store just the asset IDs.
			const coverImageRef = fields.coverImage?.["en-GB"] as
				| { sys: { id: string } }
				| undefined;
			const cover_image = coverImageRef ? coverImageRef.sys.id : "";

			const otherImagesArray = fields.otherImages?.["en-GB"] as
				| Array<{ sys: { id: string } }>
				| undefined;
			const other_images = otherImagesArray
				? otherImagesArray.map((asset) => asset.sys.id)
				: null;

			const release_year = (fields.releaseYear?.["en-GB"] as number) || null;
			const price = (fields.price?.["en-GB"] as number) || 0;
			const genre = fields.genre
				? (fields.genre["en-GB"] as string[])
				: null;
			const vinyl_condition =
				(fields.vinylCondition?.["en-GB"] as string) || null;
			const sleeve_condition =
				(fields.sleeveCondition?.["en-GB"] as string) || null;
			const label = (fields.label?.["en-GB"] as string) || null;
			const catalogue_number = fields.catalogueNumber
				? (fields.catalogueNumber["en-GB"] as string)
				: null;
			const description = fields.description
				? fields.description["en-GB"]
				: null;
			const link = fields.link ? (fields.link["en-GB"] as string) : null;
			const barcode = fields.barcode
				? (fields.barcode["en-GB"] as string)
				: null;
			const quantity = (fields.quantity?.["en-GB"] as number) || 0;
			const in_stock = (fields.inStock?.["en-GB"] as boolean) || false;
			const sold = (fields.sold?.["en-GB"] as boolean) || false;
			const album_of_the_week =
				(fields.albumOfTheWeek?.["en-GB"] as boolean) || false;

			const vinylRecordData = {
				id: recordId,
				title,
				sub_title,
				artist_names,
				artist_names_text, // <-- Added field for search
				cover_image,
				other_images,
				release_year,
				price,
				genre,
				vinyl_condition,
				sleeve_condition,
				label,
				catalogue_number,
				description,
				link,
				barcode,
				quantity,
				in_stock,
				sold,
				album_of_the_week,
			};

			const { error } = await supabase
				.from("vinyl_records")
				.upsert(vinylRecordData, { onConflict: "id" });
			if (error) {
				console.error("Error upserting vinyl record:", error);
				return NextResponse.json(
					{ error: "Error upserting vinyl record" },
					{ status: 500 }
				);
			}
			return NextResponse.json({ message: "Record synced successfully" });
		}
		// If the sys.type is neither Asset nor Entry, return an appropriate response.
		return NextResponse.json(
			{ message: `Unhandled sys.type: ${sys.type}` },
			{ status: 400 }
		);
	} catch (err: unknown) {
		console.error("Error processing webhook:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
