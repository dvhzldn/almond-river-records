import { SupabaseClient } from "@supabase/supabase-js";

type RecordMetadata = {
	id: string;
	title: string;
	sub_title?: string;
	artist_names_text: string;
	catalogue_number?: string;
	label?: string;
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
		console.log(
			`🔍 Attempting Discogs search for "${record.title}" by ${record.artist_names_text}`
		);

		const releaseId = await fetchDiscogsReleaseId(record);
		if (!releaseId) {
			console.warn(`⚠️ No Discogs match found for "${record.title}"`);
			return;
		}

		console.log(`🎯 Found Discogs releaseId: ${releaseId}`);

		const tracklist = await fetchDiscogsTracklist(releaseId);
		console.log(`📀 Tracklist retrieved:`, tracklist);

		await supabase
			.from("vinyl_records")
			.update({ tracklist })
			.eq("id", record.id);

		console.log(`✅ Tracklist saved for "${record.title}"`);
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
	let query = `${record.title}`;

	if (record.sub_title) {
		query += ` ${record.sub_title}`;
		console.log(`📝 Including sub-title in search: ${record.sub_title}`);
	}

	query += ` ${record.artist_names_text}`;

	if (record.catalogue_number) {
		query += ` ${record.catalogue_number}`;
		console.log(
			`🔢 Including catalogue number in search: ${record.catalogue_number}`
		);
	}
	if (record.label) {
		query += ` ${record.label}`;
		console.log(`🏷️ Including label in search: ${record.label}`);
	}

	const token = process.env.DISCOGS_TOKEN;
	const auth = token ? `&token=${token}` : "";
	const encodedQuery = encodeURIComponent(query);
	const url = `https://api.discogs.com/database/search?q=${encodedQuery}&type=release&format=Vinyl${auth ? `&${auth}` : ""}`;

	const res = await fetch(url);
	if (!res.ok) return null;

	const data = (await res.json()) as DiscogsSearchResponse;
	const result = data.results?.[0];

	if (
		!result &&
		(record.catalogue_number || record.label || record.sub_title)
	) {
		console.warn(
			"🔁 No match with full query — retrying without label, subtitle, or catalogue number..."
		);
		return await fetchDiscogsReleaseId({
			...record,
			sub_title: undefined,
			catalogue_number: undefined,
			label: undefined,
		});
	}

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
