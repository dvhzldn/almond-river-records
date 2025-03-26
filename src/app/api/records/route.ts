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
	other_images: string[]; // Contentful asset IDs
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const getParam = (key: string) => searchParams.get(key) || "";

		const newThisWeek = getParam("newThisWeek");
		const searchQuery = getParam("search");
		const condition = getParam("condition");
		const artist = getParam("artist");
		const genre = getParam("genre");
		const decadeParam = getParam("decade");

		const limit = Number(getParam("limit")) || 24;
		const skip = Number(getParam("skip")) || 0;

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
        other_images
      `,
				{ count: "exact" }
			)
			.eq("in_stock", true)
			.eq("sold", false)
			.gt("quantity", 0)
			.order("created_at", { ascending: false })
			.range(skip, skip + limit - 1);

		if (newThisWeek) {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			query = query.gte("created_at", sevenDaysAgo.toISOString());
		}

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
			console.error("Supabase query error:", error);
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
			coverImage: r.cover_image_url,
			otherImages: r.other_images ?? [],
		}));

		return NextResponse.json(
			{ records, total: count ?? 0 },
			{
				headers: {
					"Cache-Control": "s-maxage=3600, stale-while-revalidate",
				},
			}
		);
	} catch (err) {
		console.error("Error in /api/records route:", err);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
