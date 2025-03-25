"use client";

import Image from "next/image";
import { useState } from "react";
import { useBasket } from "../api/context/BasketContext";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import OrderForm, { OrderData } from "@/components/OrderForm";
import ReturnsPolicyModal from "@/components/ReturnsPolicyModal";
export default function BasketPage() {
	const { basket, clearBasket } = useBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();

	const defaultImage = "/images/almond-river-logo.jpg";

	// Calculate order price
	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	// const totalPrice = subTotalPrice + postagePrice;

	// testing
	const totalPrice = 1;

	const recordIds = basket.map((item) => item.id);
	const description = basket
		.map((item) => `${item.artist} - ${item.title}`)
		.join(", ");

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleOrderSubmit = async (orderData: OrderData) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				process.env.NEXT_PUBLIC_BASE_URL + `/api/processOrder`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						amount: totalPrice,
						description,
						recordIds,
						orderData,
					}),
				}
			);
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

	const [isReturnsPolicyOpen, setReturnsPolicyOpen] = useState(false);

	const openReturnsPolicy = () => setReturnsPolicyOpen(true);
	const closeReturnsPolicy = () => setReturnsPolicyOpen(false);

	return (
		<div className="page-container">
			<h1 className="page-title">Basket</h1>
			<div className="content-box">
				<>
					{basket.length === 0 ? (
						<h2>Your basket is empty.</h2>
					) : (
						<div className="basket-two-column-layout">
							<div className="basket-list">
								<h2>Your Items</h2>
								{basket.map((item) => (
									<div key={item.id} className="basket-item">
										<div>
											<Image
												src={item.coverImage || defaultImage}
												alt={item.title}
												width={90}
												height={90}
												className="basket-cover"
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
												onClick={() =>
													handleRemoveFromBasket(item.id)
												}
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
									>
										Empty Basket
									</button>{" "}
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
										<h3 className="label">Total:</h3>
										<h3 className="amount">
											<strong>£{totalPrice}</strong>
										</h3>
									</div>
								</div>
								<hr />
								<em>
									NB: Items can be returned no later than{" "}
									<strong>30 days</strong> after the date of purchase.
									Please see our{" "}
									<button
										className="returns-policy"
										onClick={openReturnsPolicy}
									>
										Returns Policy
									</button>{" "}
									{/* Conditionally render the ReturnsPolicyModal */}
									{isReturnsPolicyOpen && (
										<ReturnsPolicyModal
											onClose={closeReturnsPolicy}
										/>
									)}
									for further information.
								</em>

								<hr />
							</div>
							<div className="basket-list">
								<h2>Your details</h2>
								<OrderForm
									onSubmit={handleOrderSubmit}
									loading={loading}
									error={error}
								/>
							</div>
						</div>
					)}
				</>
			</div>
		</div>
	);
}
