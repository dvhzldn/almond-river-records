"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/Modal";
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

export default function NewThisWeek() {
	const [newRecords, setNewRecords] = useState<Record[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

	useEffect(() => {
		const fetchNewRecords = async () => {
			try {
				const res = await fetch("/api/records?newThisWeek=true");
				const data = await res.json();
				setNewRecords(data.records);
			} catch (error) {
				console.error("Error fetching new records:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchNewRecords();
	}, []);

	const handleRecordClick = (record: Record) => {
		setSelectedRecord(record);
	};

	return (
		<div>
			<h2>New In Stock This Week</h2>
			{loading ? (
				<p>Loading...</p>
			) : newRecords.length === 0 ? (
				<p>No new records added this week.</p>
			) : (
				<Swiper
					modules={[Autoplay, Navigation, Pagination]}
					autoplay={{ delay: 2000, disableOnInteraction: true }}
					navigation
					loop={newRecords.length > 4}
					breakpoints={{
						// when window width is >= 0px
						0: {
							slidesPerView: 1,
							spaceBetween: 10,
						},
						// when window width is >= 640px
						640: {
							slidesPerView: 2,
							spaceBetween: 10,
						},
						// when window width is >= 768px
						768: {
							slidesPerView: 3,
							spaceBetween: 20,
						},
						// when window width is >= 1024px
						1024: {
							slidesPerView: 4,
							spaceBetween: 30,
						},
					}}
				>
					{newRecords.map((record) => (
						<SwiperSlide className="swiper-slide" key={record.id}>
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
			<div>
				<Link href="/records">
					<h2>
						<strong>View all records</strong>
					</h2>
				</Link>
			</div>
			{selectedRecord && (
				<Modal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</div>
	);
}
