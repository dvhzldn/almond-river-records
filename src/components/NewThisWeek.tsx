"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";
import Link from "next/link";
import Modal from "@/components/Modal";

// Extend the generated type so that sys includes a contentTypeId property.
type VinylRecordEntry = {
	sys: {
		id: string;
		contentTypeId: string;
	};
	fields: unknown;
};

interface Record {
	id: string;
	title: string;
	artistName: string[];
	price: number;
	vinylCondition: string;
	coverImage: string | null;
	otherImages?: string[];
	label: string;
	sleeveCondition: string;
	inStock: boolean;
	releaseYear?: number | null;
}

export default function NewThisWeek() {
	const [newRecords, setNewRecords] = useState<VinylRecordEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

	useEffect(() => {
		const fetchNewRecords = async () => {
			try {
				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				// Use a type assertion to force the output to the expected literal type.
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

				// Filter only in-stock records.
				const filteredRecords = res.items.filter((record) => {
					const fields = record.fields as unknown as IVinylRecordFields;
					return fields.inStock;
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

	// When a record is clicked, map its fields and open the modal.
	const handleRecordClick = (record: VinylRecordEntry) => {
		const fields = record.fields as unknown as IVinylRecordFields;
		const recordData: Record = {
			id: record.sys.id,
			title: fields.title ?? "Unknown Title",
			artistName: fields.artistName ?? [],
			label: fields.label ?? "Unknown Label",
			price: fields.price ?? 0,
			vinylCondition: fields.vinylCondition ?? "Unknown Condition",
			sleeveCondition: fields.sleeveCondition ?? "Unknown Condition",
			inStock: fields.inStock ?? false,
			coverImage: fields.coverImage?.fields.file?.url
				? `https:${fields.coverImage.fields.file.url}?w=250&h=250&fit=thumb&fm=webp&q=80`
				: null,
			otherImages: fields.otherImages
				? fields.otherImages
						.map((asset) =>
							asset.fields.file?.url
								? `https:${asset.fields.file.url}?w=250&h=250&fit=thumb&fm=webp&q=80`
								: null
						)
						.filter((url) => url !== null)
				: [],
			releaseYear: fields.releaseYear ?? null,
		};
		setSelectedRecord(recordData);
	};

	return (
		<div>
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
							const fields =
								record.fields as unknown as IVinylRecordFields;
							const { coverImage, artistName, title, price } = fields;

							return (
								<li
									key={record.sys.id}
									className="record-card"
									onClick={() => handleRecordClick(record)}
								>
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
									<p>£{price.toFixed(0)}</p>
								</li>
							);
						})}
					</ul>
					<div className="show-more">
						<Link href="/records">
							<h1>View all records</h1>
						</Link>
					</div>
				</>
			)}
			{selectedRecord && (
				<Modal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</div>
	);
}
