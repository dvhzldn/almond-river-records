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
	const { basket, clearBasket } = useBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const defaultImage = "/images/almond-river-logo.jpg";

	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	const totalPrice = subTotalPrice + postagePrice;

	const recordIds = basket.map((item) => item.id);
	const description = basket
		.map((item) => `${item.artist} - ${item.title}`)
		.join(", ");

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isReturnsPolicyOpen, setReturnsPolicyOpen] = useState(false);

	const trackCheckout = useTrackCheckout();

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
			console.debug("Submitting order with payload:", payload);

			const processOrderUrl =
				process.env.NEXT_PUBLIC_BASE_URL + `/api/processOrder`;
			console.debug("ProcessOrder URL:", processOrderUrl);

			const response = await fetch(processOrderUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await response.json();
			console.debug("Response data:", data);

			if (!response.ok) {
				console.error("Error processing order:", data);
				setError(data.error || "Error processing order");
				return;
			}

			if (!data.hosted_checkout_url) {
				console.error("Missing hosted_checkout_url in response:", data);
				setError("No checkout URL returned");
				return;
			}

			trackCheckout({
				artistTitle: basket
					.map((item) => `${item.artist} - ${item.title}`)
					.join(", "),
				artists: basket.map((item) => item.artist).join(", "),
				titles: basket.map((item) => item.title).join(", "),
			});

			window.location.href = data.hosted_checkout_url;
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.error("Exception caught during order submission:", err);
				setError(err.message);
			} else {
				console.error("Unexpected error:", err);
				setError("Unexpected error");
			}
		} finally {
			setLoading(false);
		}
	};

	const openReturnsPolicy = () => setReturnsPolicyOpen(true);
	const closeReturnsPolicy = () => setReturnsPolicyOpen(false);

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

							{basket.map((item) => (
								<div key={item.id} className="basket-item">
									<div>
										<Image
											src={item.coverImage || defaultImage}
											alt={`Cover of ${item.title} by ${item.artist}`}
											width={90}
											height={90}
											className="basket-cover"
											sizes="(max-width: 768px) 100vw, 250px"
											quality={60}
											loading="lazy"
											unoptimized
										/>
									</div>
									<div>
										<p>
											<strong>{item.title}</strong>
										</p>
										<p>{item.artist}</p>
										<h4>£{item.price}</h4>
										<button
											className="remove-button"
											onClick={() => handleRemoveFromBasket(item.id)}
											aria-label={`Remove ${item.title} by ${item.artist} from basket`}
										>
											Remove
										</button>
									</div>
								</div>
							))}

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
								onClick={openReturnsPolicy}
								aria-haspopup="dialog"
							>
								Returns Policy
							</button>

							{/* Conditionally render the ReturnsPolicyModal */}
							{isReturnsPolicyOpen && (
								<ReturnsPolicyModal onClose={closeReturnsPolicy} />
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
