"use client";

import { useRouter } from "next/navigation";
import { useBasket } from "../api/context/BasketContext";
import Image from "next/image";

export default function BasketPage() {
	const { basket, removeFromBasket, clearBasket } = useBasket();
	const router = useRouter();

	const subTotalPrice = basket.reduce((acc, item) => acc + item.price, 0);
	const postagePrice = 7;
	const totalPrice = subTotalPrice + postagePrice;

	const handleCheckout = () => {
		// Build a comma-separated string of record IDs.
		// (Assuming each basket item has an 'id' that corresponds to its Contentful entry.)
		const recordIdsParam = basket.map((item) => item.id).join(",");

		// Build a comma-separated string of cover image URLs.
		// If an item doesn't have a coverImage, use a default.
		const coverImagesParam = basket
			.map((item) => item.coverImage || defaultImage)
			.join(",");

		// Build a description from the basket items.
		const descriptionParam = basket
			.map((item) => `${item.artist} - ${item.title}`)
			.join(", ");

		// Build query parameters.
		const queryParams = new URLSearchParams({
			recordIds: recordIdsParam, // use plural "recordIds" for multiple items
			price: totalPrice.toString(),
			description: descriptionParam,
			coverImages: coverImagesParam,
			// Optionally, you could pass additional parameters as needed.
		}).toString();

		// Redirect to PlaceOrder page where the remaining steps occur.
		router.push(`/place-order?${queryParams}`);
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
						<button className="basket-button" onClick={handleCheckout}>
							Buy Now
						</button>
					</>
				)}
			</div>
		</div>
	);
}
