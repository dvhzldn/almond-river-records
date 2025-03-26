"use client";
import Image from "next/image";
import Modal from "@/components/Modal";
import { useState } from "react";
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
	coverImage: string | null;
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

	return (
		<div>
			<h2>New In The Shop This Week</h2>
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
				>
					{records.map((record) => (
						<SwiperSlide key={record.id}>
							<div
								className="record-card-slider"
								onClick={() => handleRecordClick(record)}
							>
								{record.coverImage && (
									<Image
										className="record-image"
										src={record.coverImage}
										alt={`${record.title} cover`}
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
		</div>
	);
}
