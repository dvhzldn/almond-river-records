import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client with service key to bypass RLS
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Optimise Contentful image URL
function getOptimizedImageUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("//")) url = "https:" + url;
	return `${url}?w=400&h=400&fm=webp&q=70&fit=thumb`;
}

// Fetch asset metadata from Contentful
async function fetchAsset(assetId: string) {
	try {
		const res = await fetch(
			`https://cdn.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}/assets/${assetId}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
				},
			}
		);
		if (!res.ok) throw new Error(`Failed to fetch asset ${assetId}`);
		return await res.json();
	} catch (err) {
		console.error(`❌ Error fetching asset ${assetId}:`, err);
		return null;
	}
}

export async function POST(req: Request) {
	try {
		const payload = await req.json();

		// Exit early if not a vinyl record
		if (payload.sys?.contentType?.sys?.id !== "vinylRecord") {
			console.log("➡️ Skipping non-vinylRecord content.");
			return NextResponse.json({ ignored: true }, { status: 200 });
		}

		const f = payload.fields;
		const id = payload.sys.id;

		// ---- Vinyl Record Fields ----
		const record = {
			id,
			title: f.title?.["en-GB"] ?? "",
			sub_title: f.subTitle?.["en-GB"] ?? null,
			artist_names: f.artistName?.["en-GB"] ?? [],
			artist_names_text: (f.artistName?.["en-GB"] ?? []).join(", "),
			price: f.price?.["en-GB"] ?? 0,
			vinyl_condition: f.vinylCondition?.["en-GB"] ?? "Unknown",
			sleeve_condition: f.sleeveCondition?.["en-GB"] ?? "Unknown",
			label: f.label?.["en-GB"] ?? "",
			release_year: f.releaseYear?.["en-GB"] ?? 0,
			genre: f.genre?.["en-GB"] ?? [],
			description: f.description?.["en-GB"] ?? null,
			link: f.link?.["en-GB"] ?? null,
			catalogue_number: f.catalogueNumber?.["en-GB"] ?? null,
			barcode: f.barcode?.["en-GB"] ?? null,
			quantity: f.quantity?.["en-GB"] ?? 1,
			in_stock: f.inStock?.["en-GB"] ?? true,
			sold: f.sold?.["en-GB"] ?? false,
			album_of_the_week: f.albumOfTheWeek?.["en-GB"] ?? false,
			album_of_week: f.albumOfTheWeek?.["en-GB"] ?? false, // for legacy reasons
			cover_image: null as string | null,
			cover_image_url: null as string | null,
			other_images: [] as string[],
		};

		// ---- Images ----
		const coverRef = f.coverImage?.["en-GB"];
		const otherRefs = f.otherImages?.["en-GB"] ?? [];

		const allImageIds = [
			...(coverRef?.sys?.id ? [coverRef.sys.id] : []),
			...otherRefs.map((ref: { sys: { id: string } }) => ref.sys.id),
		];

		// Insert assets first so foreign key constraints succeed
		for (const assetId of allImageIds) {
			console.log(`Fetching asset: ${assetId}`);
			const asset = await fetchAsset(assetId); // Fetch the asset data from Contentful
			if (!asset) continue;

			console.log(`Fetched asset data: ${JSON.stringify(asset)}`);

			const file = asset.fields?.file?.["en-GB"];
			await supabase.from("contentful_assets").upsert(
				{
					id: asset.sys.id,
					title: asset.fields?.title?.["en-GB"] ?? null,
					url: file?.url ?? null, // Set URL from file data
					details: file?.details ?? null,
					file_name: file?.fileName ?? null,
					content_type: file?.contentType ?? null,
					created_at: asset.sys?.createdAt ?? null,
					updated_at: asset.sys?.updatedAt ?? null,
					revision: asset.sys?.revision ?? null,
					published_version: asset.sys?.publishedVersion ?? null,
				},
				{ onConflict: "id" } // Use upsert to insert or update the asset based on ID
			);

			if (assetId === coverRef?.sys?.id) {
				console.log(
					`Cover image found. Setting cover_image_url for record: ${id}`
				);
				// If this is the cover image, set the cover image details
				record.cover_image = assetId;
				record.cover_image_url = file?.url
					? getOptimizedImageUrl(file.url) // Format the URL using the helper function
					: null;
			} else {
				record.other_images.push(assetId);
			}
		}

		// Insert the vinyl record
		const { error } = await supabase
			.from("vinyl_records")
			.upsert(record, { onConflict: "id" });

		if (error) {
			console.error("❌ Error inserting vinyl record:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		console.log(`✅ Record ${id} processed successfully.`);
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("❌ Webhook error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unexpected error" },
			{ status: 500 }
		);
	}
}
