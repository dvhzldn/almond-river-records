import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

// Use the signing secret from your environment.
// This should match the secret in your Contentful Webhook Request Certification settings.
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
// Here we try concatenating rawBody + timestamp.
const validateWebhookSignature = async (req: Request, rawBody: string) => {
	// Retrieve the signature, timestamp, and signed headers.
	const signature = req.headers.get("x-contentful-signature");
	const timestamp = req.headers.get("x-contentful-timestamp") || "";

	if (!signature) {
		console.error("No signature header found.");
		return false;
	}

	// Build the string to sign by concatenating rawBody and the timestamp.
	const stringToSign = rawBody + timestamp;

	// Compute the HMAC SHA256 signature using the signing secret
	const computedSignature = crypto
		.createHmac("sha256", CONTENTFUL_SIGNING_SECRET)
		.update(stringToSign)
		.digest("hex");

	// Log the details for debugging (remove these logs in production)
	console.log("Raw Body:", rawBody);
	console.log("Timestamp:", timestamp);
	console.log("String to Sign (rawBody + timestamp):", stringToSign);
	console.log("Computed Signature:", computedSignature);
	console.log("Contentful Signature:", signature);

	// Return true if the computed signature matches the signature from Contentful.
	return signature === computedSignature;
};

export async function POST(request: Request) {
	try {
		// Read the raw body of the request
		const rawBody = await request.text();
		console.log("Webhook Payload:", rawBody);

		// Parse the payload
		const payload = JSON.parse(rawBody) as ContentfulWebhookPayload;

		// Validate the webhook signature (using the signing secret)
		const isValid = await validateWebhookSignature(request, rawBody);
		if (!isValid) {
			console.error("Invalid webhook signature");
			return NextResponse.json(
				{ error: "Invalid webhook signature" },
				{ status: 403 }
			);
		}

		// Ensure the 'fields' property exists
		if (!payload.fields) {
			throw new Error("Payload is missing the 'fields' property");
		}

		const { sys, fields } = payload;
		const recordId = sys.id;

		// If the payload is for an Asset, upsert into contentful_assets.
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

		// Otherwise, if the payload is an Entry, assume it is a vinyl record.
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

		// If sys.type is neither Asset nor Entry, return an appropriate response.
		return NextResponse.json(
			{ message: `Unhandled sys.type: ${sys.type}` },
			{ status: 400 }
		);
	} catch (err: unknown) {
		console.error("Error processing webhook:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
