import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
	const { data, error } = await supabase
		.from("vinyl_records")
		.select("id, title, artist_names, description, cover_image")
		.eq("album_of_the_week", true)
		.order("updated_at", { ascending: false })
		.limit(1);

	if (error || !data?.[0]) {
		return NextResponse.json({ error: "No album found" }, { status: 404 });
	}

	const album = data[0];

	const { data: imageData } = await supabase
		.from("contentful_assets")
		.select("url")
		.eq("id", album.cover_image)
		.single();

	const coverImageUrl = imageData?.url ?? null;

	return NextResponse.json({
		...album,
		cover_image_url: coverImageUrl,
	});
}
