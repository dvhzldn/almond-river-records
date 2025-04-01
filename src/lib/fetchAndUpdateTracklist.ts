import { SupabaseClient } from "@supabase/supabase-js";

type RecordMetadata = {
	id: string;
	title: string;
	artist_names_text: string;
};

interface DiscogsTrack {
	position: string;
	title: string;
	duration?: string;
	type_: string;
}

interface DiscogsSearchResult {
	id: number;
	type: string;
	title: string;
}

interface DiscogsSearchResponse {
	results: DiscogsSearchResult[];
}

interface DiscogsReleaseResponse {
	tracklist: DiscogsTrack[];
}

export async function fetchAndUpdateTracklist(
	supabase: SupabaseClient,
	record: RecordMetadata
): Promise<void> {
	try {
		const releaseId = await fetchDiscogsReleaseId(record);
		if (!releaseId) {
			console.warn(`⚠️ No Discogs match found for "${record.title}"`);
			return;
		}

		const tracklist = await fetchDiscogsTracklist(releaseId);

		await supabase
			.from("vinyl_records")
			.update({ tracklist /*, discogs_release_id: releaseId */ })
			.eq("id", record.id);

		console.log(`✅ Tracklist added for "${record.title}"`);
	} catch (error) {
		console.error(
			`❌ Error fetching Discogs data for "${record.title}":`,
			error
		);
	}
}

async function fetchDiscogsReleaseId(
	record: RecordMetadata
): Promise<string | null> {
	const query = encodeURIComponent(
		`${record.title} ${record.artist_names_text}`
	);
	const url = `https://api.discogs.com/database/search?q=${query}&type=release&format=Vinyl`;

	const res = await fetch(url);
	if (!res.ok) return null;

	const data = (await res.json()) as DiscogsSearchResponse;
	const result = data.results?.[0];
	return result?.id?.toString() ?? null;
}

async function fetchDiscogsTracklist(releaseId: string): Promise<string[]> {
	const url = `https://api.discogs.com/releases/${releaseId}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Discogs release ${releaseId} fetch failed`);

	const data = (await res.json()) as DiscogsReleaseResponse;
	return data.tracklist.map((track) => {
		const duration = track.duration ? ` – ${track.duration}` : "";
		return `${track.position}: ${track.title}${duration}`;
	});
}
