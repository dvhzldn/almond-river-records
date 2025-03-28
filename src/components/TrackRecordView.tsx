"use client";
import { useEffect } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

type Props = {
	recordId: string;
	title: string;
	artistName: string;
	price: number;
	genre?: string;
};

export default function TrackRecordView({ title, artistName }: Props) {
	const { track } = useAnalytics();

	useEffect(() => {
		track("record-view", {
			artist: artistName,
			title,
			artistTitle: `${artistName} - ${title}`,
		});
	}, [track, artistName, title]);

	return null;
}
