"use client";
import { useEffect } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

type Props = {
	recordId: string;
	title: string;
	artistName: string;
	price: number;
	genre?: string[] | string | null;
};

export default function TrackRecordView({
	recordId,
	title,
	artistName,
	price,
	genre,
}: Props) {
	const { track } = useAnalytics();
	const formattedGenre = Array.isArray(genre)
		? genre.join(", ")
		: (genre ?? "unknown");

	useEffect(() => {
		track("record-view", {
			recordId,
			title,
			artistName,
			price,
			genre: formattedGenre,
		});
	}, [track, recordId, title, artistName, price, formattedGenre]);

	return null;
}
