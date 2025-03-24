import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSupabaseOptions() {
	const [artistOptions, setArtistOptions] = useState<string[]>([]);
	const [genreOptions, setGenreOptions] = useState<string[]>([]);
	const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function fetchOptions() {
			setLoadingOptions(true);
			try {
				// Query vinyl_records to extract all artist_names arrays.
				const { data: artistsData, error: artistsError } = await supabase
					.from("vinyl_records")
					.select("artist_names");
				if (artistsError) throw artistsError;

				// Flatten the arrays and create a unique sorted list of artist names.
				const allArtists = (artistsData || []).flatMap(
					(record) => record.artist_names || []
				);
				const uniqueArtists = Array.from(new Set(allArtists)).sort((a, b) =>
					a.localeCompare(b)
				);
				setArtistOptions(uniqueArtists);

				// Query vinyl_records to extract all genre arrays.
				const { data: genresData, error: genresError } = await supabase
					.from("vinyl_records")
					.select("genre");
				if (genresError) throw genresError;

				// Flatten the arrays and create a unique sorted list of genres.
				const allGenres = (genresData || []).flatMap(
					(record) => record.genre || []
				);
				const uniqueGenres = Array.from(new Set(allGenres)).sort((a, b) =>
					a.localeCompare(b)
				);
				setGenreOptions(uniqueGenres);
			} catch (err) {
				console.error("Error fetching supabase options:", err);
				setError(err as Error);
			} finally {
				setLoadingOptions(false);
			}
		}

		fetchOptions();
	}, []);

	return { artistOptions, genreOptions, loadingOptions, error };
}
