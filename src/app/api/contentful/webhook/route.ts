import { NextResponse } from "next/server";
import type { Document as ContentfulDocument } from "@contentful/rich-text-types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Helper: optimize Contentful image URLs for CDN
const getOptimizedImageUrl = (url: string): string => {
	if (!url) return "";
	if (url.startsWith("//")) url = "https:" + url;
	return `${url}?w=400&h=400&fm=webp&q=70&fit=thumb`;
};

async function fetchAssetUrl(assetId: string): Promise<string | null> {
	try {
		const res = await fetch(
			`https://cdn.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}/assets/${assetId}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
				},
			}
		);
		const data = await res.json();
		const url = data.fields?.file?.["en-GB"]?.url;
		return getOptimizedImageUrl(url);
	} catch (err) {
		console.error("Failed to fetch asset:", err);
		return null;
	}
}

type ContentfulAssetRef = {
	sys: { id: string };
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
		quantity?: { "en-GB": number };
		inStock?: { "en-GB": boolean };
		sold?: { "en-GB": boolean };
		albumOfTheWeek?: { "en-GB": boolean };
	};
};

export async function POST(req: Request) {
	try {
		const payload = (await req.json()) as ContentfulWebhookPayload;
		const f = payload.fields;

		const title = f.title?.["en-GB"];
		const artistNames = f.artist?.["en-GB"] ?? [];
		const artistText = artistNames.join(", ");

		const coverImageId = f.coverImage?.["en-GB"]?.sys?.id ?? null;
		const coverImageUrl = coverImageId
			? await fetchAssetUrl(coverImageId)
			: "";

		const otherImageIds =
			f.otherImages?.["en-GB"]?.map((img) => img.sys.id) ?? [];

		const record = {
			id: payload.sys.id,
			title,
			sub_title: f.subTitle?.["en-GB"] ?? null,
			artist_names: artistNames,
			artist_names_text: artistText,
			price: f.price?.["en-GB"] ?? 0,
			vinyl_condition: f.condition?.["en-GB"] ?? "Unknown",
			sleeve_condition: f.sleeveCondition?.["en-GB"] ?? "Unknown",
			label: f.label?.["en-GB"] ?? "",
			release_year: f.year?.["en-GB"] ?? 0,
			genre: f.genre?.["en-GB"] ?? [],
			description: f.description?.["en-GB"] ?? null,
			catalogue_number: f.catalogueNumber?.["en-GB"] ?? null,
			barcode: f.barcode?.["en-GB"] ?? null,
			quantity: f.quantity?.["en-GB"] ?? 1,
			in_stock: f.inStock?.["en-GB"] ?? true,
			sold: f.sold?.["en-GB"] ?? false,
			album_of_the_week: f.albumOfTheWeek?.["en-GB"] ?? false,
			album_of_week: f.albumOfTheWeek?.["en-GB"] ?? false,
			link: `/records/${f.slug?.["en-GB"] ?? payload.sys.id}`,
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
