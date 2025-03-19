"use client";

import { useBasket } from "../api/context/BasketContext";
import Image from "next/image";
import Link from "next/link";

export default function BasketPage() {
	const { basket, removeFromBasket, clearBasket } = useBasket();

	const handleCheckout = async () => {
		alert("Proceeding to checkout for all items (Feature coming soon!)");
	};

	return (
		<div className="page-container">
			<h1 className="page-title">Shopping Basket</h1>
			<div className="content-box">
				<div className="basket-container">
					{basket.length === 0 ? (
						<p>Your basket is empty.</p>
					) : (
						<>
							<ul>
								{basket.map((item) => (
									<li key={item.id} className="basket-item">
										{item.coverImage && (
											<Image
												src={item.coverImage}
												alt={item.title}
												width={100}
												height={100}
											/>
										)}
										<div>
											<h3>{item.title}</h3>
											<p>By {item.artist}</p>
											<p>Price: £{(item.price / 100).toFixed(2)}</p>
											<button
												onClick={() => removeFromBasket(item.id)}
											>
												Remove
											</button>
										</div>
									</li>
								))}
							</ul>
							<button
								onClick={clearBasket}
								className="clear-basket-button"
							>
								Clear Basket
							</button>
							<button
								onClick={handleCheckout}
								className="checkout-button"
							>
								Buy Now
							</button>
						</>
					)}
					<br />
					<Link href="/">Back to Home</Link>
				</div>
			</div>
		</div>
	);
}
