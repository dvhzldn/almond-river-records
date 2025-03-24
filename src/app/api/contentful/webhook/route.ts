import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

const CONTENTFUL_SIGNING_SECRET = process.env.CONTENTFUL_SIGNING_SECRET!;

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

// Utility function to validate webhook signature using HMAC SHA256.
// Per Contentful’s 2025 docs, the string to sign is constructed as:
//   <x-contentful-timestamp> + ":" + <rawBody>
const validateWebhookSignature = (req: Request, rawBuffer: Buffer): boolean => {
	const signature = req.headers.get("x-contentful-signature")?.trim();
	const timestamp = (req.headers.get("x-contentful-timestamp") || "").trim();

	if (!signature) {
		console.error("No signature header found.");
		return false;
	}

	// Construct the string to sign using the exact raw body bytes converted to UTF-8
	const stringToSign = `${timestamp}:` + rawBuffer.toString("utf8");

	// Compute the HMAC SHA256 signature using the signing secret
	const computedSignature = crypto
		.createHmac("sha256", CONTENTFUL_SIGNING_SECRET)
		.update(stringToSign)
		.digest("hex");

	// Log details for debugging (remove or disable in production)
	console.log("Timestamp:", timestamp);
	console.log("String to Sign:", stringToSign);
	console.log("Computed Signature:", computedSignature);
	console.log("Contentful Signature:", signature);

	return signature === computedSignature;
};

export async function POST(request: Request) {
	try {
		// Read the raw body as an arrayBuffer once and convert to Buffer
		const buffer = Buffer.from(await request.arrayBuffer());
		const rawBody = buffer.toString("utf8");
		console.log("Webhook Payload:", rawBody);

		// Validate the webhook signature using the raw buffer
		const isValid = validateWebhookSignature(request, buffer);
		if (!isValid) {
			console.error("Invalid webhook signature");
			return NextResponse.json(
				{ error: "Invalid webhook signature" },
				{ status: 403 }
			);
		}

		// Parse the payload using the rawBody string
		const payload = JSON.parse(rawBody) as ContentfulWebhookPayload;

		if (!payload.fields) {
			throw new Error("Payload is missing the 'fields' property");
		}

		const { sys, fields } = payload;
		const recordId = sys.id;

		if (sys.type === "Asset") {
			const title = fields.title ? (fields.title["en-GB"] as string) : null;
			const fileData = fields.file
				? (fields.file["en-GB"] as AssetFileData)
				: null;
			let url = fileData?.url || "";
			if (url && url.startsWith("//")) {
				url = "https:" + url;
			}
			if (url.includes("images.contentful.com")) {
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

		if (sys.type === "Entry") {
			const title = (fields.title?.["en-GB"] as string) || null;
			const sub_title = (fields.subTitle?.["en-GB"] as string) || null;
			const artist_names = (fields.artistName?.["en-GB"] as string[]) || [];
			const artist_names_text = artist_names.join(" ");

			const coverImageRef = fields.coverImage?.["en-GB"] as {
				sys: { id: string };
			};
			const cover_image = coverImageRef ? coverImageRef.sys.id : "";

			const otherImagesArray =
				(fields.otherImages?.["en-GB"] as Array<{ sys: { id: string } }>) ||
				[];
			const other_images = otherImagesArray.map((asset) => asset.sys.id);

			const vinylRecordData = {
				id: recordId,
				title,
				sub_title,
				artist_names,
				artist_names_text,
				cover_image,
				other_images,
				release_year: fields.releaseYear?.["en-GB"],
				price: fields.price?.["en-GB"],
				genre: fields.genre?.["en-GB"] || [],
				vinyl_condition: fields.vinylCondition?.["en-GB"],
				sleeve_condition: fields.sleeveCondition?.["en-GB"],
				label: fields.label?.["en-GB"],
				catalogue_number: fields.catalogueNumber?.["en-GB"],
				description: fields.description?.["en-GB"],
				link: fields.link?.["en-GB"],
				barcode: fields.barcode?.["en-GB"],
				quantity: fields.quantity?.["en-GB"],
				in_stock: fields.inStock?.["en-GB"],
				sold: fields.sold?.["en-GB"],
				album_of_the_week: fields.albumOfTheWeek?.["en-GB"],
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

		return NextResponse.json(
			{ message: `Unhandled sys.type: ${sys.type}` },
			{ status: 400 }
		);
	} catch (err: unknown) {
		console.error("Error processing webhook:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
