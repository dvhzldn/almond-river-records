import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Document as ContentfulDocument } from "@contentful/rich-text-types";

// Helper: optimize Contentful image URLs for CDN
const getOptimizedImageUrl = (url: string): string => {
	if (!url) return "";
	if (url.startsWith("//")) url = "https:" + url;
	return `${url}?w=400&h=400&fm=webp&q=70&fit=thumb`;
};

type ContentfulAssetRef = {
	sys: { id: string };
	fields: {
		file: {
			"en-GB": {
				url: string;
			};
		};
	};
};

type ContentfulImageListRef = {
	sys: { id: string };
}[];

type ContentfulWebhookPayload = {
	sys: { id: string };
	fields: {
		title: { "en-GB": string };
		subTitle?: { "en-GB": string };
		artist: { "en-GB": string[] };
		price: { "en-GB": number };
		condition: { "en-GB": string };
		sleeveCondition: { "en-GB": string };
		label: { "en-GB": string };
		year: { "en-GB": number };
		genre?: { "en-GB": string[] };
		description?: { "en-GB": ContentfulDocument };
		catalogueNumber?: { "en-GB": string };
		barcode?: { "en-GB": string };
		slug: { "en-GB": string };
		coverImage: { "en-GB": ContentfulAssetRef };
		otherImages?: { "en-GB": ContentfulImageListRef };
	};
};

export async function POST(req: Request) {
	try {
		const payload = (await req.json()) as ContentfulWebhookPayload;
		const f = payload.fields;

		const coverImageAsset = f.coverImage["en-GB"];
		const coverImageId = coverImageAsset.sys.id;
		const coverImageUrl = getOptimizedImageUrl(
			coverImageAsset.fields.file["en-GB"].url
		);

		const otherImageIds =
			f.otherImages?.["en-GB"].map((img) => img.sys.id) ?? [];

		const record = {
			id: payload.sys.id,
			title: f.title["en-GB"],
			sub_title: f.subTitle?.["en-GB"] ?? null,
			artist_names: f.artist["en-GB"],
			artist_names_text: f.artist["en-GB"].join(", "),
			price: f.price["en-GB"],
			vinyl_condition: f.condition["en-GB"],
			sleeve_condition: f.sleeveCondition["en-GB"],
			label: f.label["en-GB"],
			release_year: f.year["en-GB"],
			genre: f.genre?.["en-GB"] ?? [],
			description: f.description?.["en-GB"] ?? null,
			catalogue_number: f.catalogueNumber?.["en-GB"] ?? null,
			barcode: f.barcode?.["en-GB"] ?? null,
			quantity: 1,
			in_stock: true,
			sold: false,
			album_of_the_week: false,
			album_of_week: false,
			link: `/records/${f.slug["en-GB"]}`,
			cover_image: coverImageId,
			cover_image_url: coverImageUrl,
			other_images: otherImageIds,
		};

		const { error } = await supabase
			.from("vinyl_records")
			.upsert(record, { onConflict: "id" });

		if (error) {
			console.error("Supabase insert error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("Contentful webhook sync error:", err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
