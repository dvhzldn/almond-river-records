"use client";

import { useBasket } from "../api/context/BasketContext";
import Image from "next/image";
import Link from "next/link";

export default function BasketPage() {
	const { basket, removeFromBasket, clearBasket } = useBasket();

	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	const totalPrice = subTotalPrice + postagePrice;

	const handleCheckout = async () => {
		const checkoutTotal = totalPrice;
		const description = basket
			.map((item) => `${item.artist} - ${item.title}`)
			.join(", ");

		const orderId = `basket-${Date.now()}`;

		try {
			const response = await fetch("/api/sumup/createCheckout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: checkoutTotal,
					description,
					orderId,
				}),
			});

			if (!response.ok) {
				const errData = await response.json();
				console.error("Error response from SumUp:", errData);
				alert(errData.error || "Error creating payment link");
				return;
			}

			const data = await response.json();
			console.log("Full Checkout Data:", JSON.stringify(data, null, 2));

			if (data.hosted_checkout_url) {
				console.log(
					"Redirecting to SumUp checkout:",
					data.hosted_checkout_url
				);
				window.location.href = data.hosted_checkout_url;
			} else {
				console.error("Payment not processed. No checkout link available.");
				alert("Payment not processed. No checkout link available.");
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			alert(
				err instanceof Error
					? `Unexpected error: ${err.message}`
					: "An unexpected error occurred."
			);
		}
	};

	const defaultImage = "/images/almond-river-logo.jpg";

	return (
		<div className="page-container">
			<h1 className="page-title">Your Basket</h1>
			{basket.length > 0}
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
										/>{" "}
										<button
											className="remove-button"
											onClick={() => removeFromBasket(item.id)}
										>
											Remove
										</button>
									</div>

									<div>
										<h3>{item.title}</h3>
										<h3>By {item.artist}</h3>
										<h2>£{item.price}</h2>
									</div>
								</div>
							))}
						</div>
						<div>
							<h3>Sub-total: £{subTotalPrice}</h3>
							<h3>Postage: £{postagePrice}</h3>
							<br />
							<h2>
								Total: <strong>£{totalPrice}</strong>
							</h2>
						</div>
						<button className="basket-button" onClick={handleCheckout}>
							Buy Now
						</button>
						<button className="clear-button" onClick={clearBasket}>
							Clear Basket
						</button>
					</>
				)}
				<Link href="/" className="back-to-home">
					Back to Home
				</Link>
			</div>
		</div>
	);
}
