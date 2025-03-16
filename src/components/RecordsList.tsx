"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
	IVinylRecord,
	IVinylRecordFields,
	IArtist,
} from "@/@types/generated/contentful";

// Extend the generated type so that sys includes a contentTypeId property.
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

interface RecordsListProps {
	recordsData: VinylRecordEntry[];
}

// Define the type for a Contentful file object (adjust as needed)
interface AssetFile {
	url: string;
}

export default function RecordsList({ recordsData }: RecordsListProps) {
	const [selectedRecord, setSelectedRecord] =
		useState<VinylRecordEntry | null>(null);

	return (
		<main style={{ padding: "1rem" }}>
			<h1>Records for sale</h1>
			{recordsData.length === 0 ? (
				<p>No records found.</p>
			) : (
				<ul style={{ listStyle: "none", padding: 10 }}>
					{recordsData.map((record) => {
						const fields = record.fields as IVinylRecordFields;
						return (
							<li
								key={record.sys.id}
								style={{
									marginBottom: "2rem",
									borderBottom: "1px solid #ccc",
									paddingBottom: "1rem",
								}}
							>
								{fields.artist && fields.artist.length > 0 && (
									<h3
										style={{ cursor: "pointer" }}
										onClick={() => setSelectedRecord(record)}
									>
										{fields.artist
											.map(
												(entry) =>
													(entry as IArtist).fields.artistName
											)
											.join(", ")}
									</h3>
								)}
								<h2
									style={{ cursor: "pointer" }}
									onClick={() => setSelectedRecord(record)}
								>
									{fields.title}
								</h2>
								{fields.subTitle && <p>{fields.subTitle}</p>}
								{fields.coverImage && fields.coverImage.fields.file && (
									<Image
										src={`https:${fields.coverImage.fields.file.url}`}
										alt={fields.title}
										width={250}
										height={250}
										onClick={() => setSelectedRecord(record)}
										style={{ cursor: "pointer" }}
									/>
								)}
								<p>
									Price: {fields.price ? `£${fields.price}` : "N/A"}
								</p>
							</li>
						);
					})}
				</ul>
			)}

			{selectedRecord && (
				<Modal onClose={() => setSelectedRecord(null)}>
					{(() => {
						const fields = selectedRecord.fields as IVinylRecordFields;
						// Build an array of image files with explicit type
						const images: AssetFile[] = [];
						if (fields.coverImage && fields.coverImage.fields.file) {
							images.push(fields.coverImage.fields.file as AssetFile);
						}
						if (fields.rearImage && fields.rearImage.fields.file) {
							images.push(fields.rearImage.fields.file as AssetFile);
						}
						if (fields.otherImage && Array.isArray(fields.otherImage)) {
							fields.otherImage.forEach((asset) => {
								if (asset.fields.file) {
									images.push(asset.fields.file as AssetFile);
								}
							});
						}

						return (
							<div>
								<h2>{fields.title}</h2>
								{fields.subTitle && <h3>{fields.subTitle}</h3>}
								{images.length > 0 && (
									<Swiper
										modules={[Autoplay, Navigation, Pagination]}
										autoplay={{
											delay: 3000,
											disableOnInteraction: true,
										}}
										navigation
										pagination={{ clickable: true }}
										loop
									>
										{images.map((file, index) => (
											<SwiperSlide key={index}>
												<Image
													src={`https:${file.url}`}
													alt={`${fields.title} image ${index + 1}`}
													width={450}
													height={450}
												/>
											</SwiperSlide>
										))}
									</Swiper>
								)}
								<p>
									<strong>Release Date:</strong>{" "}
									{fields.releaseDate ?? "N/A"}
								</p>
								<p>
									<strong>Genre:</strong> {fields.genre ?? "N/A"}
								</p>
								<p>
									<strong>Catalogue Number:</strong>{" "}
									{fields.catalogueNumber ?? "N/A"}
								</p>
								<p>
									<strong>Barcode:</strong> {fields.barcode ?? "N/A"}
								</p>
								<p>
									<strong>Vinyl Condition:</strong>{" "}
									{fields.vinylCondition}
								</p>
								<p>
									<strong>Sleeve Condition:</strong>{" "}
									{fields.sleeveCondition}
								</p>
								<p>
									<strong>Price:</strong>{" "}
									{fields.price ? `£${fields.price}` : "N/A"}
								</p>
								{fields.description && (
									<div>
										<h4>Description:</h4>
										{documentToReactComponents(fields.description)}
									</div>
								)}
							</div>
						);
					})()}
				</Modal>
			)}
		</main>
	);
}
