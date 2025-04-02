import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import ClientRecordBrowser from "@/components/ClientRecordBrowser";
import type { VinylRecord } from "@/hooks/useRecords";

export const metadata: Metadata = {
	title: "Records for Sale – Almond River",
};

export default async function RecordsPage() {
	// Fetch all in-stock records
	const { data: recordsData } = await supabase
		.from("vinyl_records")
		.select("*")
		.eq("in_stock", true)
		.limit(100); // consider pagination here later

	const records = (recordsData ?? []).map(
		(r): VinylRecord => ({
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
			inStock: r.in_stock,
		})
	);

	// Fetch artist options
	const { data: artistData } = await supabase
		.from("vinyl_records")
		.select("artist_names");
	const allArtists = (artistData ?? []).flatMap((r) => r.artist_names || []);
	const artistOptions = Array.from(new Set(allArtists)).sort();

	// Fetch genre options
	const { data: genreData } = await supabase
		.from("vinyl_records")
		.select("genre");
	const allGenres = (genreData ?? []).flatMap((r) => r.genre || []);
	const genreOptions = Array.from(new Set(allGenres)).sort();

	return (
		<main className="page-container">
			<h1 className="page-title">Records for Sale</h1>
			<ClientRecordBrowser
				initialRecords={records}
				artistOptions={artistOptions}
				genreOptions={genreOptions}
			/>
		</main>
	);
}
