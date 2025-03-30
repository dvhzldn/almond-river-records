import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function constructImageUrl(filePath: string, optimized = false): string {
	if (!filePath) return "";
	const base = `https:${filePath}`;
	return optimized ? `${base}?w=400&h=400&fm=webp&q=70&fit=thumb` : base;
}

async function fetchContentfulAsset(assetId: string) {
	const url = `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}/assets/${assetId}`;
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN}`,
			"Content-Type": "application/json",
		},
	});
	if (!res.ok) {
		console.error(`❌ Failed to fetch asset ${assetId} from Contentful`);
		return null;
	}
	return await res.json();
}

export async function POST(req: Request) {
	try {
		const payload = await req.json();
		const sys = payload.sys;

		// ---- Handle Assets ----
		if (sys?.type === "Asset") {
			const id = sys.id;
			const f = payload.fields;

			const file = f.file?.["en-GB"];
			const asset = {
				id,
				title: f.title?.["en-GB"] ?? null,
				url: constructImageUrl(file?.url, false),
				details: file?.details ?? null,
				file_name: file?.fileName ?? null,
				content_type: file?.contentType ?? null,
				created_at: sys.createdAt ?? new Date().toISOString(),
				updated_at: sys.updatedAt ?? new Date().toISOString(),
				revision: sys.revision ?? null,
				published_version: sys.publishedVersion ?? null,
			};

			const { error } = await supabase
				.from("contentful_assets")
				.upsert(asset, { onConflict: "id" });

			if (error) {
				console.error("❌ Error inserting asset:", error);
				return NextResponse.json(
					{ error: "Error inserting asset" },
					{ status: 500 }
				);
			}

			console.log(`✅ Asset ${id} inserted/updated.`);
			return NextResponse.json({ success: true }, { status: 200 });
		}

		// ---- Handle Vinyl Records ----
		if (sys?.contentType?.sys?.id !== "vinylRecord") {
			console.log("➡️ Skipping non-vinylRecord content.");
			return NextResponse.json({ ignored: true }, { status: 200 });
		}

		const f = payload.fields;
		const id = sys.id;

		// Build base record object
		const record = {
			id,
			title: f.title?.["en-GB"] ?? "",
			sub_title: f.subTitle?.["en-GB"] ?? null,
			artist_names: f.artistName?.["en-GB"] ?? [],
			artist_names_text: (f.artistName?.["en-GB"] ?? []).join(" & "),
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
			album_of_week: f.albumOfTheWeek?.["en-GB"] ?? false,
			cover_image: null as string | null,
			cover_image_url: null as string | null,
			other_images: [] as string[],
		};

		// Extract references
		const coverRef = f.coverImage?.["en-GB"];
		const otherRefs = f.otherImages?.["en-GB"] ?? [];

		// ✅ Fetch and assign cover image
		if (coverRef?.sys?.id) {
			const assetId = coverRef.sys.id;
			const asset = await fetchContentfulAsset(assetId);

			if (!asset) {
				console.error("❌ Could not retrieve cover asset. Aborting.");
				return NextResponse.json(
					{ error: "Asset not found" },
					{ status: 500 }
				);
			}

			const file = asset.fields?.file?.["en-GB"];
			const filePath = file?.url;

			if (!filePath) {
				console.error("❌ Asset file path missing.");
				return NextResponse.json(
					{ error: "Asset file missing" },
					{ status: 500 }
				);
			}

			// Required values
			record.cover_image = assetId;
			record.cover_image_url = constructImageUrl(filePath, true);

			// Optional: upsert asset to contentful_assets table
			await supabase.from("contentful_assets").upsert(
				{
					id: asset.sys.id,
					title: asset.fields?.title?.["en-GB"] ?? null,
					url: constructImageUrl(filePath, false),
					details: file?.details ?? null,
					file_name: file?.fileName ?? null,
					content_type: file?.contentType ?? null,
					created_at: asset.sys?.createdAt ?? new Date().toISOString(),
					updated_at: asset.sys?.updatedAt ?? new Date().toISOString(),
					revision: asset.sys?.revision ?? null,
					published_version: asset.sys?.publishedVersion ?? null,
				},
				{ onConflict: "id" }
			);
		}

		// 🚨 Guard against missing required image fields
		if (!record.cover_image || !record.cover_image_url) {
			console.error(
				"❌ Missing cover_image or cover_image_url — cannot insert vinyl record."
			);
			return NextResponse.json(
				{ error: "Missing cover_image or cover_image_url" },
				{ status: 400 }
			);
		}

		// Add other image references (if any)
		for (const ref of otherRefs) {
			if (ref?.sys?.id && ref.sys.id !== record.cover_image) {
				record.other_images.push(ref.sys.id);
			}
		}

		// ✅ Insert vinyl record
		const { error } = await supabase
			.from("vinyl_records")
			.upsert(record, { onConflict: "id" });

		if (error) {
			console.error("❌ Error inserting vinyl record:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		console.log(`✅ Record ${id} inserted/updated successfully.`);
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("❌ Webhook error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unexpected error" },
			{ status: 500 }
		);
	}
}
