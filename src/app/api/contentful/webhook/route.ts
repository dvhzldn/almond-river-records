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
		const reqBody = await request.text();
		console.log("Webhook payload:", reqBody);
		const payload = (await request.json()) as ContentfulWebhookPayload;
		const { sys, fields } = payload;
		const recordId = sys.id;

		// Cast fields to expected types.
		const title = (fields.title?.["en-GB"] as string) || null;
		const sub_title = fields.subTitle
			? (fields.subTitle["en-GB"] as string)
			: null;
		const artist_names = (fields.artistName?.["en-GB"] as string[]) || [];
		const cover_image =
			((
				fields.coverImage?.["en-GB"] as {
					fields: { file: { "en-GB": { url: string } } };
				}
			)?.fields?.file?.["en-GB"]?.url as string) || "";

		const other_images = fields.otherImages
			? (
					(fields.otherImages["en-GB"] as Array<{
						fields: { file: { "en-GB": { url: string } } };
					}>) ?? []
				).map((asset) => asset.fields.file["en-GB"].url)
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

		// Upsert (insert or update) the record in Supabase.
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
