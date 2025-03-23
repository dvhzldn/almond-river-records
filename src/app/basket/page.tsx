// /basket/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useBasket } from "../api/context/BasketContext";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import OrderForm, { OrderData } from "@/components/OrderForm";

export default function BasketPage() {
	const { basket, clearBasket } = useBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();

	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	const totalPrice = subTotalPrice + postagePrice;
	const defaultImage = "/images/almond-river-logo.jpg";

	// Prepare basket details
	const recordIds = basket.map((item) => item.id);
	const coverImages = basket.map((item) => item.coverImage || defaultImage);
	const description = basket
		.map((item) => `${item.artist} - ${item.title}`)
		.join(", ");

	// Local state for form submission
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleOrderSubmit = async (orderData: OrderData) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/processOrder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: totalPrice,
					description,
					recordIds,
					coverImages, // if needed on the backend
					orderData,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.error || "Error processing order");
				return;
			}
			// Redirect to the SumUp hosted checkout URL.
			window.location.href = data.hosted_checkout_url;
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Unexpected error");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page-container">
			<h1 className="page-title">Your Basket</h1>
			<div className="content-box">
				{basket.length === 0 ? (
					<p>Your basket is empty.</p>
				) : (
					<>
						<div className="basket-list">
							{basket.map((item) => (
								<div key={item.id} className="basket-item">
									<div>
										<Image
											src={item.coverImage || defaultImage}
											alt={item.title}
											width={120}
											height={120}
											className="basket-cover"
										/>
									</div>
									<button
										className="remove-button"
										onClick={() => handleRemoveFromBasket(item.id)}
									>
										Remove
									</button>
									<div>
										<h3>{item.title}</h3>
										<h3>By {item.artist}</h3>
										<h2>£{item.price}</h2>
									</div>
								</div>
							))}
						</div>
						<div>
							<button className="clear-button" onClick={clearBasket}>
								Clear
							</button>
							<hr />
							<h3>Sub-total: £{subTotalPrice}</h3>
							<h3>Postage: £{postagePrice}</h3>
							<br />
							<h2>
								Total: <strong>£{totalPrice}</strong>
							</h2>
						</div>
						{/* Render the order form and pass the submission callback */}
						<OrderForm
							onSubmit={handleOrderSubmit}
							loading={loading}
							error={error}
						/>
					</>
				)}
			</div>
		</div>
	);
}
