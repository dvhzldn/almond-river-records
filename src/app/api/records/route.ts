import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Helper function to get a normalized cover image URL.
const getCoverImageUrl = (cover: unknown): string | null => {
	if (!cover) return null;
	if (Array.isArray(cover)) {
		if (cover.length === 0) return null;
		const url = (cover[0] as { url: string }).url;
		return url.startsWith("//") ? "https:" + url : url;
	}
	if (typeof cover === "object" && "url" in cover) {
		const url = (cover as { url: string }).url;
		return url.startsWith("//") ? "https:" + url : url;
	}
	return null;
};

// Helper function to normalize an "other image" asset.
const getOtherImageUrl = (asset: unknown): string | null => {
	if (!asset) return null;
	if (Array.isArray(asset)) {
		if (asset.length === 0) return null;
		const first = asset[0];
		if (first && typeof first === "object" && "url" in first) {
			const url = (first as { url: string }).url;
			return url.startsWith("//") ? "https:" + url : url;
		}
		return null;
	}
	if (typeof asset === "object" && "url" in asset) {
		const url = (asset as { url: string }).url;
		return url.startsWith("//") ? "https:" + url : url;
	}
	return null;
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		// Retrieve query parameters
		const newThisWeek = searchParams.get("newThisWeek");
		const searchQuery = searchParams.get("search") || "";
		const condition = searchParams.get("condition") || "";
		const artist = searchParams.get("artist") || "";
		const artists = searchParams.getAll("artist");
		const genre = searchParams.get("genre") || "";
		const genres = searchParams.getAll("genre");

		// Pagination: default limit 24, skip 0
		const limitParam = searchParams.get("limit")
			? Number(searchParams.get("limit"))
			: 24;
		const skipParam = searchParams.get("skip")
			? Number(searchParams.get("skip"))
			: 0;

		// Build the Supabase query.
		let query = supabase
			.from("vinyl_records")
			.select(
				`
          id,
          title,
          artist_names,
          price,
          vinyl_condition,
          sleeve_condition,
          label,
          release_year,
          genre,
          cover_image,
          cover_image_asset:contentful_assets!vinyl_records_cover_image_fkey (
            id,
            url
          ),
          other_images,
          other_images_assets:vinyl_record_other_images!vinyl_record_id (
            asset:contentful_assets!vinyl_record_other_images_asset_id_fkey (
              id,
              url
            )
          )
        `,
				{ count: "exact" }
			)
			.eq("in_stock", true)
			.eq("sold", false)
			.gt("quantity", 0)
			.order("created_at", { ascending: false })
			.range(skipParam, skipParam + limitParam - 1);

		if (newThisWeek) {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			query = query.gte("created_at", sevenDaysAgo.toISOString());
		}

		if (searchQuery) {
			query = query.or(
				`title.ilike.%${searchQuery}%,artist_names::text.ilike.%${searchQuery}%`
			);
		}

		if (condition) {
			query = query.eq("vinyl_condition", condition);
		}

		if (artist) {
			query = query.contains("artist_names", [artist]);
		} else if (artists.length > 0) {
			query = query.or(
				artists.map((a) => `artist_names.cs.{${a}}`).join(",")
			);
		}

		if (genre) {
			query = query.contains("genre", [genre]);
		} else if (genres.length > 0) {
			query = query.or(genres.map((g) => `genre.cs.{${g}}`).join(","));
		}

		const { data, error, count } = await query;
		if (error) {
			console.error("Supabase query error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch records", details: error.message },
				{ status: 500 }
			);
		}

		const records = (data || []).map((r) => ({
			id: r.id,
			title: r.title,
			artistName: r.artist_names,
			price: r.price,
			vinylCondition: r.vinyl_condition,
			sleeveCondition: r.sleeve_condition,
			label: r.label,
			releaseYear: r.release_year,
			genre: r.genre || [],
			coverImage: getCoverImageUrl(r.cover_image_asset),
			otherImages: r.other_images_assets
				? (Array.isArray(r.other_images_assets)
						? r.other_images_assets
						: [r.other_images_assets]
					)
						.map((row: { asset: unknown }) => getOtherImageUrl(row.asset))
						.filter((url): url is string => url !== null)
				: [],
		}));

		return NextResponse.json({ records, total: count });
	} catch (err) {
		console.error("Error in /api/records route:", err);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
