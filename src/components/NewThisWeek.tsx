"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import client from "@/lib/contentful";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";
import Link from "next/link";

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

				// Format date correctly for TypeScript compliance
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
					return fields.inStock; // Only show in-stock records
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
			<h2>New In Stock This Week</h2>
			<h3>Our latest additions to the shop...</h3>
			{loading ? (
				<p>Loading...</p>
			) : newRecords.length === 0 ? (
				<p>No new records added this week.</p>
			) : (
				<>
					<ul className="records-grid">
						{newRecords.slice(0, 3).map((record) => {
							const fields = record.fields as IVinylRecordFields;
							const { coverImage, artistName, title, price } = fields;

							return (
								<li key={record.sys.id} className="record-card">
									{coverImage?.fields.file && (
										<Image
											className="record-image"
											src={`http:${coverImage.fields.file.url}?w=250&h=250&fit=thumb&fm=webp&q=80`}
											alt={`${title} cover`}
											width={250}
											height={250}
										/>
									)}
									<p>
										<strong>{title}</strong>
									</p>
									<p>{artistName.join(", ")}</p>
									<p>£{price.toFixed(2)}</p>
								</li>
							);
						})}
					</ul>
					<div className="show-more">
						<Link className="text" href="/records">
							Show me the rest of the records
						</Link>
					</div>
				</>
			)}
		</section>
	);
}
