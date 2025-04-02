import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import ClientRecordBrowser from "@/components/ClientRecordBrowser";
import type { VinylRecord } from "@/hooks/useRecords";

export const metadata: Metadata = {
	title: "Records for Sale – Almond River",
};

export default async function RecordsPage() {
	const { data: recordsData } = await supabase
		.from("vinyl_records")
		.select(
			`
			id,
			title,
			sub_title,
			artist_names,
			cover_image_url,
			release_year,
			price,
			genre,
			vinyl_condition,
			sleeve_condition,
			label,
			quantity,
			tracklist
		`
		)
		.gt("quantity", 0) // Only include records that are in stock
		.limit(100);

	const records: VinylRecord[] = (recordsData ?? []).map((r) => ({
		id: r.id,
		title: r.title,
		subTitle: r.sub_title ?? "",
		artistName: r.artist_names,
		coverImageUrl: r.cover_image_url,
		releaseYear: r.release_year,
		price: r.price,
		genre: r.genre ?? [],
		vinylCondition: r.vinyl_condition,
		sleeveCondition: r.sleeve_condition,
		label: r.label,
		inStock: r.quantity > 0,
		tracklist: r.tracklist ?? [],
	}));

	const artistOptions = Array.from(
		new Set(records.flatMap((r) => r.artistName))
	).sort();

	const genreOptions = Array.from(
		new Set(records.flatMap((r) => r.genre))
	).sort();

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
