import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useAddToBasketWithTracking } from "@/hooks/useAddToBasketWithTracking";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import { useBasket } from "@/app/api/context/BasketContext";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons";
import TrackRecordView from "./TrackRecordView";
import { useEffect, useRef } from "react";
import TrackList from "./TrackList";

interface ModalProps {
	record: {
		title: string;
		artistName: string[];
		label: string;
		price: number;
		vinylCondition: string;
		sleeveCondition: string;
		coverImageUrl?: string;
		otherImages?: string[];
		releaseYear?: number | null;
		genre?: string[] | string;
		id: string;
		tracklist?: string[];
	};
	onClose: () => void;
}

export default function Modal({ record, onClose }: ModalProps) {
	const images: string[] = [];
	if (record.coverImageUrl) images.push(record.coverImageUrl);
	if (record.otherImages?.length) images.push(...record.otherImages);

	const { basket } = useBasket();
	const { handleAddToBasket } = useAddToBasketWithTracking();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const { handleBuyNow } = useBuyNow();
	const router = useRouter();

	const isInBasket = basket.some((item) => item.id === record.id);

	const onBuy = () => {
		if (!isInBasket) {
			handleBuyNow({
				id: record.id,
				title: record.title,
				artistName: record.artistName,
				price: record.price,
				coverImage: record.coverImageUrl,
			});
		}
		onClose();
		router.push("/basket");
	};

	const onAddToBasket = () => {
		handleAddToBasket(
			{
				id: record.id,
				title: record.title,
				artistName: record.artistName,
				price: record.price,
				coverImage: record.coverImageUrl,
			},
			onClose
		);
	};

	const onRemoveFromBasket = () => {
		handleRemoveFromBasket(record.id, onClose);
	};

	// 🔒 Focus trap setup
	const modalRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement;
		modalRef.current?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			previouslyFocused?.focus();
		};
	}, [onClose]);

	return (
		<div
			className="backdrop"
			role="presentation"
			aria-hidden="true"
			onClick={onClose}
			tabIndex={-1}
		>
			<div
				className="modalContent"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				aria-describedby="modal-description"
				tabIndex={-1}
				ref={modalRef}
				onClick={(e) => e.stopPropagation()}
			>
				<TrackRecordView
					recordId={record.id}
					title={record.title}
					artistName={record.artistName.join(", ")}
					price={record.price}
					genre={
						Array.isArray(record.genre)
							? record.genre.join(", ")
							: record.genre
					}
				/>

				<button
					className="closeButton"
					onClick={onClose}
					aria-label="Close modal"
				>
					×
				</button>

				<h2 id="modal-title">{record.title}</h2>
				<h3>{record.artistName.join(", ")}</h3>
				<h3>
					Price: <strong>£{record.price}</strong>
				</h3>

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

				<div className="modal-image-container" id="modal-description">
					<button
						className="buy-button modal-above-image modal-top-left"
						onClick={onBuy}
					>
						Buy
					</button>
					{isInBasket ? (
						<button
							className="remove-button modal-above-image modal-top-right"
							onClick={onRemoveFromBasket}
						>
							Remove <FontAwesomeIcon icon={faShoppingBasket} />
						</button>
					) : (
						<button
							className="basket-button modal-above-image modal-top-right"
							onClick={onAddToBasket}
						>
							Add <FontAwesomeIcon icon={faShoppingBasket} />
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

					{record.tracklist && record.tracklist.length > 0 ? (
						<div style={{ maxWidth: "500px", marginInline: "auto" }}>
							<TrackList tracklist={record.tracklist} />
						</div>
					) : (
						<p className="text"></p>
					)}
				</div>
			</div>
			<div
				tabIndex={0}
				aria-hidden="true"
				onFocus={() => modalRef.current?.focus()}
			/>
		</div>
	);
}
