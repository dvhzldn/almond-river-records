import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const CONTENTFUL_SIGNING_SECRET = process.env.CONTENTFUL_SIGNING_SECRET!;

interface ContentfulWebhookFields {
	[key: string]: { "en-GB": unknown };
}

interface ContentfulWebhookPayload {
	sys: {
		id: string;
		type: string;
		createdAt?: string;
		updatedAt?: string;
		contentType?: {
			sys: { id: string };
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

// Updated utility function to validate webhook signature using the full canonical request representation.
// The canonical string is built as:
//   <HTTP_METHOD>\n<REQUEST_PATH>\n<CANONICAL_SIGNED_HEADERS>\n<REQUEST_BODY>
const validateWebhookSignature = (req: Request, rawBuffer: Buffer): boolean => {
	const signature = req.headers.get("x-contentful-signature")?.trim();
	const timestamp = (req.headers.get("x-contentful-timestamp") || "").trim();

	if (!signature) {
		console.error("No signature header found.");
		return false;
	}

	// (Optional) TTL check: ensure the timestamp is within an acceptable window (e.g. 60 seconds)
	const currentTime = Date.now();
	if (Number(timestamp) + 60000 < currentTime) {
		console.error("Request timestamp is too old.");
		return false;
	}

	// Get the HTTP method
	const method = req.method; // e.g. "POST"

	// Build the request path, including any query string.
	const urlObj = new URL(req.url);
	const requestPath = urlObj.pathname + urlObj.search; // already URL encoded as needed

	// Build the canonical signed headers.
	// The header x-contentful-signed-headers tells you which headers are included.
	const signedHeadersList = (
		req.headers.get("x-contentful-signed-headers") || ""
	)
		.split(",")
		.map((h) => h.trim())
		.filter((h) => h.length > 0);

	// For each signed header, get its value from the request headers,
	// lowercase the header name, and join with a colon.
	const canonicalHeaders = signedHeadersList
		.map((headerName) => {
			const headerValue = req.headers.get(headerName) || "";
			return `${headerName.toLowerCase()}:${headerValue}`;
		})
		.join(";");

	// The request body as received
	const requestBody = rawBuffer.toString("utf8");

	// Build the canonical representation
	const canonicalRequestRepresentation = [
		method,
		requestPath,
		canonicalHeaders,
		requestBody,
	].join("\n");

	// Compute the HMAC SHA256 signature using the signing secret
	const computedSignature = crypto
		.createHmac("sha256", CONTENTFUL_SIGNING_SECRET)
		.update(canonicalRequestRepresentation)
		.digest("hex");

	// Debug logging (remove or disable in production)
	console.log(
		"Canonical Request Representation:",
		canonicalRequestRepresentation
	);
	console.log("Computed Signature:", computedSignature);
	console.log("Contentful Signature:", signature);

	return signature === computedSignature;
};

export async function POST(request: Request) {
	try {
		// Read the raw body as an arrayBuffer once and convert to a Buffer
		const buffer = Buffer.from(await request.arrayBuffer());
		const rawBody = buffer.toString("utf8");
		console.log("Webhook Payload:", rawBody);

		// Validate the webhook signature using the full canonical representation
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

			const { error } = await supabaseService
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

			const { error } = await supabaseService
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
