"use client";

import React, { useState } from "react";

interface ProductPaymentProps {
	recordId: string;
	price: number;
	description: string;
	title: string;
	artist: string;
	coverImage: string;
}

const ProductPayment: React.FC<ProductPaymentProps> = ({
	recordId,
	price,
	description,
	// Include when testing Payment Success page
	// title,
	// artist,
	// coverImage,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePayment = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/sumup/createCheckout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: price,
					description,
					orderId: recordId,
				}),
			});

			if (!response.ok) {
				const errData = await response.json();
				console.error("Error response from SumUp:", errData);
				setError(errData.error || "Error creating payment link");
				setLoading(false);
				return;
			}

			const data = await response.json();
			// console.log("Full Checkout Data:", JSON.stringify(data, null, 2));

			if (data.hosted_checkout_url) {
				// console.log(
				// 	"Redirecting to SumUp checkout:",
				// 	data.hosted_checkout_url
				// );
				window.location.href = data.hosted_checkout_url;
			} else if (data.id) {
				console.warn(
					"No checkout link returned. Redirecting to test success page."
				);
				// Page redirect on failed Checkout for testing
				// window.location.href = `/payment-success?checkout_id=${data.id}&title=${encodeURIComponent(
				// 	title
				// )}&artist=${encodeURIComponent(artist)}&coverImage=${encodeURIComponent(coverImage)}`;
			} else {
				console.error(
					"Payment not processed. No checkout link or ID available."
				);
				setError("Payment not processed. No checkout link available.");
			}
		} catch (err: unknown) {
			console.error("Unexpected error:", err);
			setError(
				err instanceof Error
					? `Unexpected error: ${err.message}`
					: "An unexpected error occurred."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<br />
			<button
				className="payment-button"
				onClick={handlePayment}
				disabled={loading}
			>
				{loading ? "Processing..." : "Buy Now"}
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default ProductPayment;
