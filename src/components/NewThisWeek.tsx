"use client";

import { useEffect, useState } from "react";
import client from "@/lib/contentful";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";
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
			try {
				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				// Format date correctly to ensure strict TypeScript compliance
				const formattedDate = sevenDaysAgo
					.toISOString()
					.replace(
						/\.\d{3}Z$/,
						"Z"
					) as `${number}-${number}-${number}T${number}:${number}:${number}Z`;

				const res = (await client.getEntries({
					content_type: "vinylRecord",
					"sys.createdAt[gte]": formattedDate,
				})) as unknown as { items: VinylRecordEntry[] };

				// Ensure TypeScript recognizes `inStock` as a valid field
				const filteredRecords = res.items.filter((record) => {
					const fields = record.fields as IVinylRecordFields;
					return fields.inStock; // Only keep records that are in stock
				});

				setNewRecords(filteredRecords);
			} catch (error) {
				console.error("Error fetching new records:", error);
			} finally {
				setLoading(false);
			}
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
