"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBasket } from "../api/context/BasketContext";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";

export default function BasketPage() {
	const { basket, clearBasket } = useBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const router = useRouter();

	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	const totalPrice = subTotalPrice + postagePrice;
	const defaultImage = "/images/almond-river-logo.jpg";

	const handleCheckout = () => {
		const recordIdsParam = basket.map((item) => item.id).join(",");
		const coverImagesParam = basket
			.map((item) => item.coverImage || defaultImage)
			.join(",");
		const descriptionParam = basket
			.map((item) => `${item.artist} - ${item.title}`)
			.join(", ");
		const queryParams = new URLSearchParams({
			recordIds: recordIdsParam,
			price: totalPrice.toString(),
			description: descriptionParam,
			coverImages: coverImagesParam,
		}).toString();
		router.push(`/place-order?${queryParams}`);
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
										<button
											className="remove-button"
											onClick={() => handleRemoveFromBasket(item.id)}
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
						<button className="clear-button" onClick={clearBasket}>
							Clear
						</button>
						<div>
							<hr />
							<h3>Sub-total: £{subTotalPrice}</h3>
							<h3>Postage: £{postagePrice}</h3>
							<br />
							<h2>
								Total: <strong>£{totalPrice}</strong>
							</h2>
						</div>
						<button className="buy-button" onClick={handleCheckout}>
							Buy Now
						</button>
					</>
				)}
			</div>
		</div>
	);
}
