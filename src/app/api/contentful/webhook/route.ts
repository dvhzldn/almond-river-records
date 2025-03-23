// /app/api/contentful/webhook/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface ContentfulWebhookFields {
	[key: string]: {
		"en-GB": unknown;
	};
}

interface ContentfulWebhookPayload {
	sys: {
		id: string;
		contentType?: {
			sys: {
				id: string;
			};
		};
	};
	fields: ContentfulWebhookFields;
}

export async function POST(request: Request) {
	try {
		// Read the body once as text, log it, then parse it.
		const rawBody = await request.text();
		console.log("Webhook payload:", rawBody);
		const payload = JSON.parse(rawBody) as ContentfulWebhookPayload;

		if (!payload.fields) {
			throw new Error("Payload is missing the 'fields' property");
		}

		const { sys, fields } = payload;
		const recordId = sys.id;

		const title = (fields.title?.["en-GB"] as string) || null;
		const sub_title = fields.subTitle
			? (fields.subTitle["en-GB"] as string)
			: null;
		const artist_names = (fields.artistName?.["en-GB"] as string[]) || [];

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
		const genre = fields.genre ? (fields.genre["en-GB"] as string[]) : null;
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
	} catch (err: unknown) {
		console.error("Error processing webhook:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
