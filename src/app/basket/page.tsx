"use client";

import { useBasket } from "../api/context/BasketContext";
import Image from "next/image";
import Link from "next/link";

export default function BasketPage() {
	const { basket, removeFromBasket, clearBasket } = useBasket();

	const handleCheckout = async () => {
		alert("Feature coming soon!");
	};

	const defaultImage = "/images/almond-river-logo.jpg";

	return (
		<div className="page-container">
			<h1 className="page-title">Your Basket</h1>
			<div className="content-box">
				{basket.length === 0 ? (
					<p>Your basket is empty.</p>
				) : (
					<>
						<button className="basket-button" onClick={handleCheckout}>
							Buy Now
						</button>

						<div className="basket-list">
							{basket.map((item) => (
								<div key={item.id} className="basket-item">
									<Image
										src={item.coverImage || defaultImage}
										alt={item.title}
										width={120}
										height={120}
										className="basket-cover"
									/>

									<div>
										<h2>{item.title}</h2>
										<h3>By {item.artist}</h3>
										<p>Price: £{(item.price / 100).toFixed(2)}</p>
										<button
											className="basket-remove"
											onClick={() => removeFromBasket(item.id)}
										>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>

						<button className="basket-button" onClick={clearBasket}>
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
