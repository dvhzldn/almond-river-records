"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useBasket } from "../api/context/BasketContext";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import type { OrderData } from "@/components/OrderForm";
import { useTrackCheckout } from "@/hooks/useTrackCheckout";

const OrderForm = dynamic(() => import("@/components/OrderForm"), {
	ssr: false,
	loading: () => <p>Loading form...</p>,
});

const ReturnsPolicyModal = dynamic(
	() => import("@/components/ReturnsPolicyModal"),
	{
		ssr: false,
		loading: () => null,
	}
);

export default function BasketPage() {
	const { basket, clearBasket, hydrated } = useBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isReturnsPolicyOpen, setReturnsPolicyOpen] = useState(false);
	const trackCheckout = useTrackCheckout();

	const defaultImage = "/images/almond-river-logo.jpg";

	if (!hydrated) return null; // ✅ safe now

	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	const totalPrice = subTotalPrice + postagePrice;

	const recordIds = basket.map((item) => item.id);
	const description = basket
		.map((item) => `${item.artistName.join(", ")} - ${item.title}`)
		.join(", ");

	const handleOrderSubmit = async (orderData: OrderData) => {
		setLoading(true);
		setError(null);
		try {
			const payload = {
				amount: totalPrice,
				description,
				recordIds,
				orderData,
			};
			const response = await fetch(
				process.env.NEXT_PUBLIC_BASE_URL + `/api/processOrder`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}
			);
			const data = await response.json();

			if (!response.ok || !data.hosted_checkout_url) {
				setError(data.error || "Error processing order");
				return;
			}

			trackCheckout({
				artistTitle: basket
					.map((item) => `${item.artistName.join(", ")} - ${item.title}`)
					.join(", "),
				artists: basket
					.map((item) => item.artistName.join(", "))
					.join(", "),
				titles: basket.map((item) => item.title).join(", "),
			});

			window.location.href = data.hosted_checkout_url;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unexpected error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page-container">
			<h1 className="page-title">Basket</h1>
			<div className="content-box">
				{basket.length === 0 ? (
					<h2>Your basket is empty.</h2>
				) : (
					<div className="basket-two-column-layout">
						<section
							aria-labelledby="basket-items-heading"
							className="basket-list"
						>
							<h2 id="basket-items-heading">Your Items</h2>
							{basket.map((item, index) => {
								const imageSrc =
									item.coverImage && item.coverImage.trim() !== ""
										? item.coverImage
										: defaultImage;

								const artistName = Array.isArray(item.artistName)
									? item.artistName.join(", ")
									: item.artistName;

								return (
									<div
										key={`${item.id}-${index}`}
										className="basket-item"
									>
										<div>
											<Image
												src={imageSrc}
												alt={`Cover of ${item.title} by ${item.artistName.join(
													", "
												)}`}
												width={90}
												height={90}
												className="basket-cover"
												sizes="(max-width: 768px) 100vw, 250px"
												quality={60}
												loading="lazy"
												priority={true}
												unoptimized={true}
											/>
										</div>
										<div>
											<p>
												<strong>{item.title}</strong>
											</p>
											<p>{artistName}</p>
											<h4>£{item.price}</h4>
											<button
												className="remove-button"
												onClick={() =>
													handleRemoveFromBasket(item.id)
												}
												aria-label={`Remove ${item.title} by ${item.artistName.join(
													", "
												)} from basket`}
											>
												Remove
											</button>
										</div>
									</div>
								);
							})}

							<div>
								<button
									className="clear-button"
									onClick={clearBasket}
									aria-label="Empty basket"
								>
									Empty Basket
								</button>
								<hr />
							</div>

							<div className="basket-bill">
								<div className="bill-line">
									<h4 className="label">Product total:</h4>
									<h4 className="amount">£{subTotalPrice}</h4>
								</div>
								<div className="bill-line">
									<h4 className="label">Add Postage:</h4>
									<h4 className="amount">£{postagePrice}</h4>
								</div>
								<div className="bill-line">
									<h4 className="label">Total:</h4>
									<h4 className="amount">
										<strong>£{totalPrice}</strong>
									</h4>
								</div>
							</div>

							<hr />

							<p>
								NB: Items can be returned no later than{" "}
								<strong>30 days</strong> after the date of purchase.
							</p>

							<button
								className="returns-policy"
								onClick={() => setReturnsPolicyOpen(true)}
								aria-haspopup="dialog"
							>
								Returns Policy
							</button>

							{isReturnsPolicyOpen && (
								<ReturnsPolicyModal
									onClose={() => setReturnsPolicyOpen(false)}
								/>
							)}

							<hr />
						</section>

						<section
							aria-labelledby="order-details-heading"
							className="basket-list"
						>
							<h2 id="order-details-heading">Your Details</h2>
							<OrderForm
								onSubmit={handleOrderSubmit}
								loading={loading}
								error={error}
							/>
						</section>
					</div>
				)}
			</div>
		</div>
	);
}
