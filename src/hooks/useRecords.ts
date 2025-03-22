// hooks/useRecords.ts
import { useState, useEffect, useCallback } from "react";

export interface VinylRecord {
	id: string;
	title: string;
	artistName: string[];
	price: number;
	vinylCondition: string;
	coverImage: string | null;
	label: string;
	sleeveCondition: string;
	inStock: boolean;
	releaseYear?: number | null;
	genre: string;
}

interface UseRecordsParams {
	search?: string;
	priceMin?: string;
	priceMax?: string;
	condition?: string;
	artist?: string;
	genre?: string;
	page?: number;
	pageSize?: number;
}

export function useRecords({
	search = "",
	priceMin = "",
	priceMax = "",
	condition = "",
	artist = "",
	genre = "",
	page = 1,
	pageSize = 12,
}: UseRecordsParams) {
	const [records, setRecords] = useState<VinylRecord[]>([]);
	const [totalRecords, setTotalRecords] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchRecords = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams();
		if (search) params.append("search", search);
		if (priceMin) params.append("priceMin", priceMin);
		if (priceMax) params.append("priceMax", priceMax);
		if (condition) params.append("condition", condition);
		if (artist) params.append("artist", artist);
		if (genre) params.append("genre", genre);
		params.append("limit", pageSize.toString());
		params.append("skip", ((page - 1) * pageSize).toString());

		try {
			const res = await fetch(`/api/records?${params.toString()}`);
			if (!res.ok) {
				throw new Error("Failed to fetch records");
			}
			const data = await res.json();
			setRecords(data.records);
			setTotalRecords(data.total);
		} catch (err) {
			console.error("Error fetching records:", err);
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [search, priceMin, priceMax, condition, artist, genre, page, pageSize]);

	useEffect(() => {
		fetchRecords();
	}, [fetchRecords]);

	return { records, totalRecords, loading, error, refetch: fetchRecords };
}
