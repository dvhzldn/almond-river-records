import { Metadata } from "next";
import ClientRecordBrowser from "@/components/ClientRecordBrowser";
import type { VinylRecord } from "@/hooks/useRecords";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import RecordStructuredData from "@/components/RecordStructuredData";

export const metadata: Metadata = {
	title: "Records for Sale – Almond River",
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function RecordsPage() {
	const { data: recordsData } = await supabaseAdmin
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
		.gt("quantity", 0)
		.limit(24);

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

	const artistOptions: string[] = Array.from(
		new Set(records.flatMap((r) => r.artistName))
	).sort();

	const genreOptions: string[] = Array.from(
		new Set(records.flatMap((r) => r.genre))
	).sort();

	return (
		<main className="page-container">
			<h1 className="page-title">Records for Sale</h1>
			<RecordStructuredData records={records} />
			<ClientRecordBrowser
				initialRecords={records}
				artistOptions={artistOptions}
				genreOptions={genreOptions}
			/>
		</main>
	);
}
