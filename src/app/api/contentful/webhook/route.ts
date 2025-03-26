import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client using service role key
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to build optimized image URL from Contentful
function getOptimizedImageUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("//")) url = "https:" + url;
	return `${url}?w=400&h=400&fm=webp&q=70&fit=thumb`;
}

// Fetch full asset data from Contentful
async function fetchAssetData(assetId: string) {
	try {
		const res = await fetch(
			`https://cdn.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}/assets/${assetId}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
				},
			}
		);
		if (!res.ok) throw new Error(`Asset fetch failed: ${res.status}`);
		return await res.json();
	} catch (err) {
		console.error(`❌ Error fetching asset ${assetId}:`, err);
		return null;
	}
}

export async function POST(req: Request) {
	try {
		const payload = await req.json();
		const f = payload.fields;

		if (payload.sys?.contentType?.sys?.id !== "vinylRecord") {
			return NextResponse.json({ ignored: true }, { status: 200 });
		}

		// ---- Vinyl Record Fields ----
		const id = payload.sys.id;
		const title = f.title?.["en-GB"] ?? "";
		const subTitle = f.subTitle?.["en-GB"] ?? null;
		const artistNames = f.artistName?.["en-GB"] ?? [];
		const artistNamesText = artistNames.join(", ");
		const price = f.price?.["en-GB"] ?? 0;
		const vinylCondition = f.vinylCondition?.["en-GB"] ?? "Unknown";
		const sleeveCondition = f.sleeveCondition?.["en-GB"] ?? "Unknown";
		const label = f.label?.["en-GB"] ?? "";
		const releaseYear = f.releaseYear?.["en-GB"] ?? 0;
		const genre = f.genre?.["en-GB"] ?? [];
		const description = f.description?.["en-GB"] ?? null;
		const link = f.link?.["en-GB"] ?? null; // ⬅️ fixed
		const catalogueNumber = f.catalogueNumber?.["en-GB"] ?? null;
		const barcode = f.barcode?.["en-GB"] ?? null;
		const quantity = f.quantity?.["en-GB"] ?? 1;
		const inStock = f.inStock?.["en-GB"] ?? true;
		const sold = f.sold?.["en-GB"] ?? false;
		const albumOfTheWeek = f.albumOfTheWeek?.["en-GB"] ?? false;

		// ---- Image Handling ----
		const coverImageRef = f.coverImage?.["en-GB"];
		const coverImageId = coverImageRef?.sys?.id ?? null;
		const coverImageUrl = coverImageRef?.fields?.file?.["en-GB"]?.url
			? getOptimizedImageUrl(coverImageRef.fields.file["en-GB"].url)
			: "";

		const otherImageRefs = f.otherImages?.["en-GB"] ?? [];
		const otherImageIds = (otherImageRefs as { sys: { id: string } }[]).map(
			(img) => img.sys.id
		);

		// ---- Insert Assets ----
		const allAssetIds = [coverImageId, ...otherImageIds].filter(Boolean);

		for (const assetId of allAssetIds) {
			const asset = await fetchAssetData(assetId);
			if (asset) {
				const file = asset.fields?.file?.["en-GB"];
				await supabase.from("contentful_assets").upsert(
					{
						id: asset.sys.id,
						title: asset.fields?.title?.["en-GB"] ?? null,
						url: file?.url ?? null,
						details: file?.details ?? null,
						file_name: file?.fileName ?? null,
						content_type: file?.contentType ?? null,
						created_at: asset.sys?.createdAt ?? null,
						updated_at: asset.sys?.updatedAt ?? null,
						revision: asset.sys?.revision ?? null,
						published_version: asset.sys?.publishedVersion ?? null,
					},
					{ onConflict: "id" }
				);
			}
		}

		// ---- Insert Vinyl Record ----
		const vinylRecord = {
			id,
			title,
			sub_title: subTitle,
			artist_names: artistNames,
			artist_names_text: artistNamesText,
			price,
			vinyl_condition: vinylCondition,
			sleeve_condition: sleeveCondition,
			label,
			release_year: releaseYear,
			genre,
			description,
			link, // ⬅️ stored as jsonb from Contentful
			catalogue_number: catalogueNumber,
			barcode,
			quantity,
			in_stock: inStock,
			sold,
			album_of_the_week: albumOfTheWeek,
			album_of_week: albumOfTheWeek, // legacy duplicate
			cover_image: coverImageId,
			cover_image_url: coverImageUrl,
			other_images: otherImageIds,
		};

		const { error } = await supabase
			.from("vinyl_records")
			.upsert(vinylRecord, { onConflict: "id" });

		if (error) {
			console.error("❌ Supabase insert error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("❌ Webhook handler error:", err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
	}
}
