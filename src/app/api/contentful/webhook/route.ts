import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client with service key to bypass RLS
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Construct the optimized Contentful image URL
function constructImageUrl(assetId: string): string {
	// Base URL for the Contentful image CDN
	const baseUrl = `https://images.ctfassets.net/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`;

	// Construct the URL by appending the asset ID and optional query parameters for optimization
	return `${baseUrl}/${assetId}?w=400&h=400&fm=webp&q=70&fit=thumb`;
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

		// Construct the URL for the cover image (no need to fetch asset)
		if (coverRef?.sys?.id) {
			record.cover_image = coverRef.sys.id;
			record.cover_image_url = constructImageUrl(coverRef.sys.id);
		}

		// Process other images if necessary
		for (const assetId of allImageIds) {
			if (assetId !== coverRef?.sys?.id) {
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
