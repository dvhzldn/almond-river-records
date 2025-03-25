// File no longer in use

import { useState, useEffect } from "react";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";

export function useContentfulOptions() {
	const [artistOptions, setArtistOptions] = useState<string[]>([]);
	const [genreOptions, setGenreOptions] = useState<string[]>([]);
	const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function fetchOptions() {
			setLoadingOptions(true);
			try {
				// Fetch artists
				const resArtists = await client.getEntries({
					content_type: "vinylRecord",
					select: ["fields.artistName"],
				});
				const allArtists = resArtists.items.flatMap((item) => {
					const fields = item.fields as unknown as IVinylRecordFields;
					return fields.artistName || [];
				});
				const uniqueArtists = Array.from(new Set(allArtists)).sort((a, b) =>
					a.localeCompare(b)
				);
				setArtistOptions(uniqueArtists);

				// Fetch genres
				const resGenres = await client.getEntries({
					content_type: "vinylRecord",
				});
				const allGenres = resGenres.items.flatMap((item) => {
					const fields = item.fields as unknown as IVinylRecordFields;
					return fields.genre ?? [];
				});
				const uniqueGenres = Array.from(
					new Set(allGenres.filter(Boolean))
				).sort((a, b) => a.localeCompare(b));
				setGenreOptions(uniqueGenres);
			} catch (err) {
				console.error("Error fetching contentful options:", err);
				setError(err as Error);
			} finally {
				setLoadingOptions(false);
			}
		}
		fetchOptions();
	}, []);

	return { artistOptions, genreOptions, loadingOptions, error };
}
