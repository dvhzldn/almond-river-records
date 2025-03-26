import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createContentfulClient } from "contentful";

const supabase = createSupabaseClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const contentful = createContentfulClient({
	space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
	environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master",
	accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

const appendImageParams = (url: string): string =>
	`${url}?w=400&h=400&fm=webp&q=70&fit=thumb`;

export async function GET() {
	try {
		console.log("🔁 Starting manual Contentful sync...");

		// Step 1: Clear existing data
		console.log("🧹 Tables cleared.");

		// Step 2: Fetch entries from Contentful
		const entries = await contentful.getEntries({
			content_type: "vinylRecord",
		});
		console.log(
			`📦 Fetched ${entries.items.length} entries from Contentful.`
		);

		const allAssetsMap = new Map<string, any>();

		const vinylRecords = entries.items
			.map((entry: any) => {
				const f = entry.fields;
				if (!f.title || !f.coverImage || !f.artistName || !f.price) {
					console.warn(
						`⚠️ Skipping entry ${entry.sys.id} due to missing required fields.`
					);
					return null;
				}

				const coverImageAsset = f.coverImage;
				const coverImageId = coverImageAsset?.sys?.id || null;
				const coverImageUrl = coverImageAsset?.fields?.file?.url || null;

				if (coverImageAsset && coverImageId) {
					allAssetsMap.set(coverImageId, coverImageAsset);
				}

				const otherImageIds: string[] = [];
				const otherImages = f.otherImages ?? [];
				for (const img of otherImages) {
					if (img?.sys?.id) {
						otherImageIds.push(img.sys.id);
						allAssetsMap.set(img.sys.id, img);
					}
				}

				return {
					id: entry.sys.id,
					title: f.title,
					sub_title: f.subTitle ?? null,
					artist_names: f.artistName,
					artist_names_text: f.artistName.join(", "),
					price: f.price,
					vinyl_condition: f.vinylCondition,
					sleeve_condition: f.sleeveCondition,
					label: f.label,
					release_year: f.releaseYear,
					genre: f.genre ?? [],
					description: f.description ?? null,
					catalogue_number: f.catalogueNumber ?? null,
					barcode: f.barcode ?? null,
					quantity: f.quantity ?? 1,
					in_stock: f.inStock ?? true,
					sold: f.sold ?? false,
					album_of_the_week: f.albumOfTheWeek ?? false,
					album_of_week: f.albumOfTheWeek ?? false, // support both
					link: f.link ? `/records/${entry.sys.id}` : null,
					cover_image: coverImageId,
					cover_image_url: coverImageUrl
						? appendImageParams(
								coverImageUrl.startsWith("//")
									? "https:" + coverImageUrl
									: coverImageUrl
							)
						: null,
					other_images: otherImageIds,
				};
			})
			.filter((r) => r !== null);

		// Step 3: Build contentful_assets
		const seenAssetIds = new Set<string>();
		const contentfulAssets = Array.from(allAssetsMap.values())
			.filter((asset: any) => {
				const id = asset.sys?.id;
				if (!id || seenAssetIds.has(id)) return false;
				seenAssetIds.add(id);
				return true;
			})
			.map((asset: any) => {
				const file = asset.fields?.file;
				return {
					id: asset.sys.id,
					title: asset.fields?.title ?? null,
					url: file?.url?.startsWith("//")
						? `https:${file.url}`
						: (file?.url ?? null),
					file_name: file?.fileName ?? null,
					content_type: file?.contentType ?? null,
					details: file?.details ?? null,
					created_at: asset.sys.createdAt,
					updated_at: asset.sys.updatedAt,
					revision: asset.sys.revision ?? null,
					published_version: asset.sys.publishedVersion ?? null,
				};
			});

		// Step 4: Insert assets
		const { error: assetError } = await supabase
			.from("contentful_assets")
			.upsert(contentfulAssets, { onConflict: "id" });

		if (assetError) {
			console.error("❌ Asset insert error:", assetError);
			return NextResponse.json(
				{ error: "Failed to insert assets", details: assetError.message },
				{ status: 500 }
			);
		}

		// Step 5: Insert vinyl records
		const { error: recordError } = await supabase
			.from("vinyl_records")
			.upsert(vinylRecords, { onConflict: "id" });

		if (recordError) {
			console.error("❌ Record insert error:", recordError);
			return NextResponse.json(
				{ error: "Failed to insert records", details: recordError.message },
				{ status: 500 }
			);
		}

		console.log("✅ Manual sync complete.");
		return NextResponse.json({
			success: true,
			recordsImported: vinylRecords.length,
			assetsImported: contentfulAssets.length,
		});
	} catch (err: any) {
		console.error("❌ Sync failed:", err);
		return NextResponse.json(
			{ error: "Sync failed", details: err.message || err.toString() },
			{ status: 500 }
		);
	}
}
