"use client";
import { useEffect, useState } from "react";

type Review = {
	rating: number;
	text: string;
};

export default function GoogleReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [currentReview, setCurrentReview] = useState<Review | null>(null);

	useEffect(() => {
		const cachedReviews = sessionStorage.getItem("reviews");

		if (cachedReviews) {
			const parsedReviews = JSON.parse(cachedReviews);
			setReviews(parsedReviews);
			setCurrentReview(
				parsedReviews[Math.floor(Math.random() * parsedReviews.length)]
			); // Set initial review
		} else {
			fetch("/api/reviews")
				.then((res) => res.json())
				.then((data) => {
					setReviews(data);
					setCurrentReview(data[Math.floor(Math.random() * data.length)]); // Set initial review
					sessionStorage.setItem("reviews", JSON.stringify(data));
				})
				.catch((error) => {
					console.error("Error fetching reviews:", error);
				});
		}
	}, []);

	useEffect(() => {
		if (reviews.length > 1) {
			const interval = setInterval(() => {
				setCurrentReview((prevReview) => {
					let newReview;
					do {
						newReview =
							reviews[Math.floor(Math.random() * reviews.length)];
					} while (newReview === prevReview); // Ensure a different review is picked
					return newReview;
				});
			}, 60000); // Change review every 60 seconds

			return () => clearInterval(interval);
		}
	}, [reviews]);

	if (!currentReview) return <p>Loading reviews...</p>;

	const renderStars = (rating: number) => "⭐".repeat(rating);

	return (
		<section className="reviews-section">
			<div className="review-container">
				<span className="review-rating">
					{renderStars(currentReview.rating)}
				</span>
				<p className="review-text">{currentReview.text}</p>
			</div>
		</section>
	);
}
