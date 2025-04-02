"use client";
import { useState, useEffect } from "react";
import { VinylRecord } from "./useRecords";

import { supabase } from "@/lib/supabaseClient";

export function useFilteredRecords(filters) {
	const [records, setRecords] = useState<VinylRecord[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetch() {
			setLoading(true);
			const query = supabase
				.from("vinyl_records")
				.select("*")
				.eq("in_stock", true)
				.order(filters.sort === "recent" ? "created_at" : "artist_names", {
					ascending: filters.sort !== "recent",
				});

			if (filters.search) {
				query.or(
					`title.ilike.%${filters.search}%,artist_names_text.ilike.%${filters.search}%`
				);
			}

			if (filters.artist)
				query.ilike("artist_names_text", `%${filters.artist}%`);
			if (filters.genre) query.contains("genre", [filters.genre]);
			if (filters.condition) query.eq("vinyl_condition", filters.condition);
			if (filters.decade) {
				const start = parseInt(filters.decade, 10);
				query.gte("release_year", start).lte("release_year", start + 9);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching records:", error);
				setRecords([]);
			} else {
				setRecords(
					data.map((r) => ({
						id: r.id,
						title: r.title,
						artistName: r.artist_names,
						price: r.price,
						vinylCondition: r.vinyl_condition,
						sleeveCondition: r.sleeve_condition,
						label: r.label,
						releaseYear: r.release_year,
						genre: r.genre,
						coverImageUrl: r.cover_image_url,
						otherImages: r.other_images ?? [],
						tracklist: r.tracklist ?? [],
						inStock: r.inStock,
					}))
				);
			}

			setLoading(false);
		}

		fetch();
	}, [filters]);

	return { records, loading };
}
