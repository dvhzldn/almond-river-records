"use client";

import Image from "next/image";
import { useAddToBasketWithTracking } from "@/hooks/useAddToBasketWithTracking";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import { useBasket } from "@/app/api/context/BasketContext";
import { useRouter } from "next/navigation";
import TrackRecordView from "./TrackRecordView";
import { useEffect, useRef } from "react";
import TrackList from "./TrackList";
import { ShoppingBasket } from "lucide-react";

interface ModalProps {
	record: {
		title: string;
		artistName: string[];
		label: string;
		price: number;
		vinylCondition: string;
		sleeveCondition: string;
		coverImageUrl: string;
		otherImages?: string[];
		releaseYear?: number | null;
		genre?: string[] | string;
		id: string;
		tracklist?: string[];
	};
	onClose: () => void;
}

export default function Modal({ record, onClose }: ModalProps) {
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
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement;
		closeButtonRef.current?.focus();

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
			aria-hidden="true"
			onClick={onClose}
			tabIndex={-1}
		>
			{" "}
			<div
				tabIndex={0}
				aria-hidden="true"
				onFocus={() => closeButtonRef.current?.focus()}
			/>
			<div
				className="modalContent"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				aria-describedby="modal-description"
				onClick={(e) => e.stopPropagation()}
			>
				<TrackRecordView
					recordId={record.id}
					title={record.title}
					artistName={record.artistName.join(" & ")}
					price={record.price}
					genre={
						Array.isArray(record.genre)
							? record.genre.join(" & ")
							: record.genre
					}
				/>

				<button
					className="closeButton"
					onClick={onClose}
					aria-label="Close modal"
					ref={closeButtonRef}
				>
					×
				</button>

				<h2 id="modal-title">{record.title}</h2>
				<h3>{record.artistName.join(" & ")}</h3>
				<h3>
					Price: <strong>£{record.price}</strong>
				</h3>

				{record.coverImageUrl && (
					<Image
						className="modal-image"
						src={record.coverImageUrl}
						alt={`Cover image for ${record.title}`}
						width={450}
						height={450}
						sizes="(max-width: 768px) 100vw, 250px"
						quality={60}
						loading="lazy"
					/>
				)}

				<div className="modal-image-container" id="modal-description">
					<button
						aria-label={`Buy ${record.title} by ${record.artistName.join(" & ")}`}
						className="buy-button modal-above-image modal-top-left"
						onClick={onBuy}
					>
						Buy
					</button>
					{isInBasket ? (
						<button
							aria-label={`Remove ${record.title} by ${record.artistName.join(" & ")} from your basket`}
							className="remove-button modal-above-image modal-top-right"
							onClick={onRemoveFromBasket}
						>
							Remove
						</button>
					) : (
						<button
							aria-label={`Add ${record.title} by ${record.artistName.join(" & ")} to your basket`}
							className="basket-button modal-above-image modal-top-right"
							onClick={onAddToBasket}
						>
							Add{` `}
							<ShoppingBasket size={12} />
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
				onFocus={() => closeButtonRef.current?.focus()}
			/>
		</div>
	);
}
