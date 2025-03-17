"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";

// Define the type with Contentful system metadata
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

interface RecordsListProps {
	recordsData: VinylRecordEntry[];
}

export default function RecordsList({ recordsData }: RecordsListProps) {
	const [selectedRecord, setSelectedRecord] =
		useState<VinylRecordEntry | null>(null);

	return (
		<section className="section">
			<h1>Records for Sale</h1>
			{recordsData.length === 0 ? (
				<p>No records found.</p>
			) : (
				<ul className="list">
					{recordsData.map((record) => {
						const fields = record.fields as IVinylRecordFields;

						return (
							<li
								key={record.sys.id}
								className="listItem"
								onClick={() => setSelectedRecord(record)}
							>
								{/* Two-column layout using .record-card-content */}
								<div className="record-card-content">
									{/* Cover Image (Left) */}
									{fields.coverImage?.fields.file && (
										<Image
											className="record-image"
											src={`https:${fields.coverImage.fields.file.url}?w=150&h=150&fit=thumb`}
											alt={fields.title}
											width={150}
											height={150}
										/>
									)}

									{/* Record Details (Right) */}
									<div className="record-details">
										{/* Artist Name */}
										{fields.artistName?.length > 0 && (
											<h3>{fields.artistName.join(", ")}</h3>
										)}

										{/* Title */}
										<h2>{fields.title}</h2>

										{/* Record Info */}
										<p>Label: {fields.label ?? "Unknown"}</p>
										<p>
											Price:{" "}
											{fields.price
												? `£${fields.price.toFixed(2)}`
												: "N/A"}
										</p>
										<p>
											Stock:{" "}
											{fields.inStock ? "Available" : "Out of Stock"}
										</p>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{/* Modal - Show Detailed Record Info */}
			{selectedRecord &&
				(() => {
					const fields = selectedRecord.fields as IVinylRecordFields;

					return (
						<Modal
							record={{
								title: fields.title ?? "Unknown",
								artistName: fields.artistName ?? [],
								price: fields.price ?? 0,
								coverImage: fields.coverImage?.fields.file?.url
									? `https:${fields.coverImage.fields.file.url}`
									: null,
								otherImages:
									fields.otherImage?.flatMap((image) =>
										image.fields.file?.url
											? [`https:${image.fields.file.url}`]
											: []
									) ?? [],
								label: fields.label ?? "Unknown",
								vinylCondition: fields.vinylCondition ?? "Unknown",
								sleeveCondition: fields.sleeveCondition ?? "Unknown",
								inStock: fields.inStock ?? false,
								releaseYear: fields.releaseYear?.toString() ?? "N/A",
								catalogueNumber: fields.catalogueNumber ?? "N/A",
								barcode: fields.barcode ?? "N/A",
								description: fields.description
									? documentToReactComponents(fields.description)
									: null,
							}}
							onClose={() => setSelectedRecord(null)}
						/>
					);
				})()}
		</section>
	);
}
