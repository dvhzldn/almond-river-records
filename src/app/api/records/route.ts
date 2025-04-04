import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type VinylRecord = {
	id: string;
	title: string;
	artist_names: string[];
	artist_names_text: string;
	price: number;
	vinyl_condition: string;
	sleeve_condition: string;
	label: string;
	release_year: number;
	genre: string[];
	cover_image_url: string;
	other_images: string[];
	tracklist?: string[];
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const getParam = (key: string): string | undefined => {
			const value = searchParams.get(key);
			return value?.trim() || undefined;
		};

		const newThisWeek = getParam("newThisWeek") === "true";
		const searchQuery = getParam("search");
		const condition = getParam("condition");
		const artist = getParam("artist");
		const genre = getParam("genre");
		const decadeParam = getParam("decade");
		const sort = getParam("sort") || "recent";

		const limit = Number(getParam("limit")) || 24;
		const skip = Number(getParam("skip")) || 0;

		const includeCount = !newThisWeek;

		let query = supabase
			.from("vinyl_records")
			.select(
				`
				id,
				title,
				artist_names,
				artist_names_text,
				price,
				vinyl_condition,
				sleeve_condition,
				label,
				release_year,
				genre,
				cover_image_url,
				other_images,
				tracklist
			`,
				includeCount ? { count: "exact" } : undefined
			)
			.eq("in_stock", true)
			.eq("sold", false)
			.gt("quantity", 0);

		// Apply sorting
		if (sort === "artist") {
			query = query.order("artist_names", { ascending: true });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		// Filter for "new this week"
		if (newThisWeek) {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			query = query.gte("created_at", sevenDaysAgo.toISOString());
			query = query.limit(limit); // no need for range + count
		} else {
			query = query.range(skip, skip + limit - 1);
		}

		// Additional filters
		if (searchQuery) {
			query = query.or(
				`title.ilike.%${searchQuery}%,artist_names_text.ilike.%${searchQuery}%`
			);
		}

		if (decadeParam) {
			const decadeNum = parseInt(decadeParam, 10);
			if (!isNaN(decadeNum)) {
				query = query
					.gte("release_year", decadeNum)
					.lte("release_year", decadeNum + 9);
			}
		}

		if (condition) {
			query = query.eq("vinyl_condition", condition);
		}

		if (artist) {
			query = query.ilike("artist_names_text", `%${artist}%`);
		}

		if (genre) {
			query = query.contains("genre", [genre]);
		}

		const { data, error, count } = await query;

		if (error || !data) {
			console.error("❌ Supabase query error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch records", details: error?.message },
				{ status: 500 }
			);
		}

		const records = data.map((r: VinylRecord) => ({
			id: r.id,
			title: r.title,
			artistName: r.artist_names,
			price: r.price,
			vinylCondition: r.vinyl_condition,
			sleeveCondition: r.sleeve_condition,
			label: r.label,
			releaseYear: r.release_year,
			genre: r.genre || [],
			coverImageUrl: r.cover_image_url,
			otherImages: r.other_images ?? [],
			tracklist: r.tracklist ?? [],
		}));

		return NextResponse.json(
			{
				records,
				total: includeCount ? (count ?? 0) : undefined,
			},
			{
				headers: {
					"Cache-Control": "s-maxage=60, stale-while-revalidate",
				},
			}
		);
	} catch (err) {
		console.error("❌ Error in /api/records route:", err);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
