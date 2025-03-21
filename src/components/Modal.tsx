"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Document } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useAddToBasket } from "@/hooks/useAddToBasket";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import { useBasket } from "@/app/api/context/BasketContext";

interface ModalProps {
	record: {
		title: string;
		artistName: string[];
		label: string;
		price: number;
		vinylCondition: string;
		sleeveCondition: string;
		coverImage?: string | null;
		otherImages?: string[];
		releaseYear?: number | null;
		description?: Document;
		id: string;
	};
	onClose: () => void;
}

export default function Modal({ record, onClose }: ModalProps) {
	const images: string[] = [];
	if (record.coverImage) images.push(record.coverImage);
	if (record.otherImages && record.otherImages.length > 0) {
		images.push(...record.otherImages);
	}

	const { basket } = useBasket();
	const { handleAddToBasket } = useAddToBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();

	// This check should update when the basket context updates.
	const isInBasket = basket.some((item) => item.id === record.id);

	const onAddToBasket = () => {
		handleAddToBasket(
			{
				id: record.id,
				title: record.title,
				artistName: record.artistName,
				price: record.price,
				coverImage: record.coverImage || "",
			},
			onClose
		);
	};

	const onRemoveFromBasket = () => {
		handleRemoveFromBasket(record.id);
	};

	const queryParams = new URLSearchParams({
		recordId: record.id,
		price: record.price.toString(),
		description: `${record.artistName.join(" & ")} - ${record.title}`,
		title: record.title,
		artist: record.artistName.join(" & "),
		coverImage: record.coverImage || "",
	}).toString();

	return (
		<div className="backdrop" onClick={onClose}>
			<div className="modalContent" onClick={(e) => e.stopPropagation()}>
				<button className="closeButton" onClick={onClose}>
					×
				</button>
				<h2>{record.title}</h2>
				<h3>{record.artistName.join(", ")}</h3>
				<h3>£{record.price}</h3>

				{images.length > 0 && (
					<Swiper
						modules={[Autoplay, Navigation, Pagination]}
						autoplay={{ delay: 4000, disableOnInteraction: true }}
						navigation
						pagination={{ clickable: true }}
						loop={images.length > 1}
						slidesPerView={1}
					>
						{images.map((url, index) => (
							<SwiperSlide key={index}>
								<Image
									className="modal-image"
									src={url}
									alt={`${record.title} image ${index + 1}`}
									width={450}
									height={450}
								/>
							</SwiperSlide>
						))}
					</Swiper>
				)}
				<div className="modal-image-container">
					<Link href={`/place-order?${queryParams}`}>
						<button className="buy-button modal-above-image modal-top-left">
							Buy
						</button>
					</Link>
					{isInBasket ? (
						<button
							className="basket-button modal-above-image modal-top-right"
							onClick={onRemoveFromBasket}
						>
							Remove from Basket
						</button>
					) : (
						<button
							className="basket-button modal-above-image modal-top-right"
							onClick={onAddToBasket}
						>
							Add to Basket
						</button>
					)}

					<p>
						<strong>Label:</strong> {record.label}
					</p>
					<p>
						<strong>Vinyl Condition:</strong> {record.vinylCondition}
					</p>
					<p>
						<strong>Sleeve Condition:</strong> {record.sleeveCondition}
					</p>
					<p>
						<strong>Year:</strong> {record.releaseYear ?? "N/A"}
					</p>
					{record.description && (
						<div>
							<p>
								<strong>Description:</strong>
							</p>
							{documentToReactComponents(record.description)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
