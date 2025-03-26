import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function constructImageUrl(assetId: string): string {
	const baseUrl = `https://images.ctfassets.net/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`;
	return `${baseUrl}/${assetId}?w=400&h=400&fm=webp&q=70&fit=thumb`;
}

export async function POST(req: Request) {
	try {
		const payload = await req.json();
		const sys = payload.sys;

		// ---- Handle Assets ----
		if (sys?.type === "Asset") {
			const id = sys.id;
			const f = payload.fields;

			const asset = {
				id,
				title: f.title?.["en-GB"] ?? null,
				url: constructImageUrl(id),
				details: f.file?.["en-GB"]?.details ?? null,
				file_name: f.file?.["en-GB"]?.fileName ?? null,
				content_type: f.file?.["en-GB"]?.contentType ?? null,
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
			album_of_week: f.albumOfTheWeek?.["en-GB"] ?? false,
			cover_image: null as string | null,
			cover_image_url: null as string | null,
			other_images: [] as string[],
		};

		const coverRef = f.coverImage?.["en-GB"];
		const otherRefs = f.otherImages?.["en-GB"] ?? [];

		if (coverRef?.sys?.id) {
			const assetId = coverRef.sys.id;
			record.cover_image = assetId;
			record.cover_image_url = constructImageUrl(assetId);
		}

		for (const ref of otherRefs) {
			if (ref?.sys?.id && ref.sys.id !== record.cover_image) {
				record.other_images.push(ref.sys.id);
			}
		}

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
