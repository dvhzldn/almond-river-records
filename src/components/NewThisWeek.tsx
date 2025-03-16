"use client";

import { useEffect, useState } from "react";
import client from "@/lib/contentful";
import { IVinylRecord } from "@/@types/generated/contentful";
import RecordsList from "@/components/RecordsList";

// Extend the generated type so that sys includes a contentTypeId property.
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

export default function NewThisWeek() {
	const [newRecords, setNewRecords] = useState<VinylRecordEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNewRecords = async () => {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			// Format date manually to match the required format
			const formattedDate = sevenDaysAgo.toISOString().split(".")[0] + "Z"; // Ensures correct format

			const res = (await client.getEntries({
				content_type: "vinylRecord",
				"sys.createdAt[gte]":
					formattedDate as `${number}-${number}-${number}T${number}:${number}:${number}Z`,
			})) as unknown as { items: VinylRecordEntry[] };

			setNewRecords(res.items);
			setLoading(false);
		};

		fetchNewRecords();
	}, []);

	return (
		<section className="section">
			<h2>New This Week</h2>
			{loading ? (
				<p>Loading...</p>
			) : newRecords.length === 0 ? (
				<p>No new records added this week.</p>
			) : (
				<RecordsList recordsData={newRecords} />
			)}
		</section>
	);
}
