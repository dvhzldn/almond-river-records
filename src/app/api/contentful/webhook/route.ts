import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Document as ContentfulDocument } from "@contentful/rich-text-types";

// Use the service role key to bypass RLS
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to build a smaller, optimized Contentful CDN URL
const getOptimizedImageUrl = (url: string): string => {
	if (!url) return "";
	if (url.startsWith("//")) url = "https:" + url;
	return `${url}?w=400&h=400&fm=webp&q=70&fit=thumb`;
};

async function fetchAssetDetails(id: string) {
	const res = await fetch(
		`https://cdn.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}/assets/${id}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
			},
		}
	);
	if (!res.ok) throw new Error(`Asset fetch failed for ${id}`);
	const data = await res.json();
	const file = data.fields?.file?.["en-GB"];
	return {
		id: data.sys.id,
		title: data.fields?.title?.["en-GB"] ?? null,
		url: file?.url ? `https:${file.url}` : null,
		file_name: file?.fileName ?? null,
		content_type: file?.contentType ?? null,
		created_at: data.sys?.createdAt ?? null,
		updated_at: data.sys?.updatedAt ?? null,
		published_version: data.sys?.publishedVersion ?? null,
	};
}

// Webhook payload type
type ContentfulWebhookPayload = {
	sys: { id: string };
	fields: {
		title: { "en-GB": string };
		subTitle?: { "en-GB": string };
		artistName: { "en-GB": string[] };
		coverImage: { "en-GB": { sys: { id: string } } };
		otherImages?: { "en-GB": { sys: { id: string } }[] };
		releaseYear: { "en-GB": number };
		price: { "en-GB": number };
		genre: { "en-GB": string[] };
		label: { "en-GB": string };
		catalogueNumber?: { "en-GB": string };
		vinylCondition: { "en-GB": string };
		sleeveCondition: { "en-GB": string };
		description?: { "en-GB": ContentfulDocument };
		barcode?: { "en-GB": string };
		quantity?: { "en-GB": number };
		inStock: { "en-GB": boolean };
		sold: { "en-GB": boolean };
		albumOfTheWeek: { "en-GB": boolean };
	};
};

export async function POST(req: Request) {
	try {
		const payload = (await req.json()) as ContentfulWebhookPayload;
		const f = payload.fields;

		// Cover image
		const coverImageId = f.coverImage["en-GB"].sys.id;
		const coverAsset = await fetchAssetDetails(coverImageId);

		// Insert or update cover image into contentful_assets
		await supabase.from("contentful_assets").upsert({
			id: coverAsset.id,
			title: coverAsset.title,
			url: coverAsset.url,
			file_name: coverAsset.file_name,
			content_type: coverAsset.content_type,
			created_at: coverAsset.created_at,
			updated_at: coverAsset.updated_at,
			published_version: coverAsset.published_version,
		});

		// Handle other image IDs
		const otherImageIds =
			f.otherImages?.["en-GB"].map((img) => img.sys.id) ?? [];

		// Insert vinyl record
		const record = {
			id: payload.sys.id,
			title: f.title["en-GB"],
			sub_title: f.subTitle?.["en-GB"] ?? null,
			artist_names: f.artistName["en-GB"],
			artist_names_text: f.artistName["en-GB"].join(", "),
			price: f.price["en-GB"],
			vinyl_condition: f.vinylCondition["en-GB"],
			sleeve_condition: f.sleeveCondition["en-GB"],
			label: f.label["en-GB"],
			release_year: f.releaseYear["en-GB"],
			genre: f.genre["en-GB"],
			description: f.description?.["en-GB"] ?? null,
			catalogue_number: f.catalogueNumber?.["en-GB"] ?? null,
			barcode: f.barcode?.["en-GB"] ?? null,
			quantity: f.quantity?.["en-GB"] ?? 1,
			in_stock: f.inStock["en-GB"],
			sold: f.sold["en-GB"],
			album_of_the_week: f.albumOfTheWeek["en-GB"],
			album_of_week: f.albumOfTheWeek["en-GB"],
			link: `/records/${payload.sys.id}`,
			cover_image: coverImageId,
			cover_image_url: getOptimizedImageUrl(coverAsset.url ?? ""),
			other_images: otherImageIds,
		};

		const { error } = await supabase
			.from("vinyl_records")
			.upsert(record, { onConflict: "id" });

		if (error) {
			console.error("Supabase insert error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Webhook error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unexpected error" },
			{ status: 500 }
		);
	}
}
