"use client";
import { useBasket } from "@/app/api/context/BasketContext";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Document } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import ProductPayment from "./ProductPayment";
// import SimulatePayment from "./SimulatePayment";
// import SumUpConnectButton from "./SumUpConnectButton";
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
	// Collect images for Swiper
	const images: string[] = [];
	if (record.coverImage) images.push(record.coverImage);
	if (record.otherImages && record.otherImages.length > 0) {
		images.push(...record.otherImages);
	}

	const { addToBasket } = useBasket();

	const handleAddToBasket = () => {
		addToBasket({
			id: record.id,
			title: record.title,
			artist: record.artistName.join(" & "),
			price: record.price * 100,
			coverImage: record.coverImage || "",
		});
		onClose();
	};

	return (
		<div className="backdrop" onClick={onClose}>
			<div className="modalContent" onClick={(e) => e.stopPropagation()}>
				<button className="closeButton" onClick={onClose}>
					×
				</button>
				<div>
					{/* <SumUpConnectButton />
					<SimulatePayment /> */}
				</div>
				<h2>{record.title}</h2>
				<h3>{record.artistName.join(", ")}</h3>
				<h3>£{record.price}</h3>

				{/* Swiper for Images */}
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
				<ProductPayment
					recordId={record.id}
					price={record.price * 100}
					description={`Purchase of ${record.title} by ${record.artistName.join(" & ")}`}
					title={record.title}
					artist={record.artistName.join(" & ")}
					coverImage={record.coverImage || ""}
				/>
				<button className="basket-button" onClick={handleAddToBasket}>
					Add to Basket
				</button>
			</div>
		</div>
	);
}
