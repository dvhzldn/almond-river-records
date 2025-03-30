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
			);
		} else {
			fetch("/api/reviews")
				.then((res) => res.json())
				.then((data) => {
					setReviews(data);
					setCurrentReview(data[Math.floor(Math.random() * data.length)]);
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
					} while (newReview === prevReview);
					return newReview;
				});
			}, 60000);

			return () => clearInterval(interval);
		}
	}, [reviews]);

	if (!currentReview)
		return <p aria-live="polite">Loading customer reviews...</p>;

	const renderStars = (rating: number) => {
		return (
			<span
				className="review-rating"
				aria-label={`Rating: ${rating} out of 5 stars`}
			>
				{"⭐".repeat(rating)}
			</span>
		);
	};

	return (
		<div
			className="review-container"
			aria-live="polite"
			role="region"
			aria-label="Customer review"
		>
			{currentReview.text ? (
				<>
					<p className="review-text">{currentReview.text}</p>
					{renderStars(currentReview.rating)}
				</>
			) : (
				<p>This review has no written content.</p>
			)}
		</div>
	);
}
