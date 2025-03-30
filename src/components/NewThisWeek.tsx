"use client";
import Image from "next/image";
import Modal from "@/components/Modal";
import { useState, KeyboardEvent } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Record {
	id: string;
	title: string;
	artistName: string[];
	price: number;
	vinylCondition: string;
	coverImageUrl: string;
	otherImages?: string[];
	label: string;
	sleeveCondition: string;
	inStock: boolean;
	releaseYear?: number | null;
}

interface NewThisWeekProps {
	records: Record[];
}

export default function NewThisWeek({ records }: NewThisWeekProps) {
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

	const handleRecordClick = (record: Record) => {
		setSelectedRecord(record);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, record: Record) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleRecordClick(record);
		}
	};

	return (
		<section aria-labelledby="new-this-week-carousel">
			<h3 id="new-this-week-carousel" className="sr-only">
				New This Week Record Carousel
			</h3>

			{records.length === 0 ? (
				<p>No new records added this week.</p>
			) : (
				<Swiper
					modules={[Autoplay, Navigation, Pagination]}
					autoplay={{ delay: 2000, disableOnInteraction: true }}
					navigation
					loop={records.length > 4}
					breakpoints={{
						0: { slidesPerView: 1, spaceBetween: 10 },
						640: { slidesPerView: 2, spaceBetween: 10 },
						768: { slidesPerView: 3, spaceBetween: 20 },
						1024: { slidesPerView: 4, spaceBetween: 30 },
					}}
					aria-label="New records carousel"
				>
					{records.map((record) => (
						<SwiperSlide key={record.id}>
							<div
								className="record-card-slider"
								onClick={() => handleRecordClick(record)}
								onKeyDown={(e) => handleKeyDown(e, record)}
								role="button"
								tabIndex={0}
								aria-label={`View details for ${record.title} by ${record.artistName.join(", ")}`}
							>
								{record.coverImageUrl && (
									<Image
										className="record-image"
										src={record.coverImageUrl}
										alt={`${record.title} by ${record.artistName.join(", ")} cover art`}
										width={250}
										height={250}
									/>
								)}
								<p>
									<strong>{record.title}</strong>
								</p>
								<p>{record.artistName.join(", ")}</p>
								<p>£{record.price.toFixed(0)}</p>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			)}

			{selectedRecord && (
				<Modal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</section>
	);
}
