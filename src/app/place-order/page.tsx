"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface OrderData {
	name: string;
	email: string;
	address1: string;
	address2: string;
	address3: string;
	city: string;
	postcode: string;
}

const PlaceOrder: React.FC = () => {
	const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
		null
	);

	useEffect(() => {
		// On client-side, useSearchParams to get search params
		const params = new URLSearchParams(window.location.search);
		setSearchParams(params);
	}, []);

	// Make sure searchParams is available before accessing its values
	const initialRecordId = searchParams?.get("recordId") || "";
	const initialPrice = Number(searchParams?.get("price")) || 0;
	const initialDescription = searchParams?.get("description") || "";
	const initialTitle = searchParams?.get("title") || "";
	const initialArtist = searchParams?.get("artist") || "";
	const initialCoverImage = searchParams?.get("coverImage") || "";

	const [orderData, setOrderData] = useState<OrderData>({
		name: "",
		email: "",
		address1: "",
		address2: "",
		address3: "",
		city: "",
		postcode: "",
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOrderData({
			...orderData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Create order and save details to Google Sheets
			const orderResponse = await fetch("/api/createOrder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					orderId: initialRecordId, // or let the backend generate one
					...orderData,
					// Product details plus auto-populated items field:
					price: initialPrice,
					description: initialDescription,
					title: initialTitle,
					artist: initialArtist,
					coverImage: initialCoverImage,
					items: `${initialTitle} - ${initialArtist}`,
					orderDate: new Date().toISOString(),
				}),
			});

			const orderDataResponse = await orderResponse.json();
			if (!orderResponse.ok) {
				setError(orderDataResponse.error || "Error creating order");
				return;
			}
			const newOrderId = orderDataResponse.orderId;

			// Immediately create SumUp checkout session
			const paymentResponse = await fetch("/api/sumup/createCheckout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: initialPrice,
					description: initialDescription,
					orderId: newOrderId,
				}),
			});

			const paymentData = await paymentResponse.json();
			if (!paymentResponse.ok) {
				setError(paymentData.error || "Error initiating payment");
				return;
			}

			if (paymentData.hosted_checkout_url) {
				// Redirect immediately to SumUp hosted checkout URL
				window.location.href = paymentData.hosted_checkout_url;
			} else {
				setError("Payment not processed. No checkout link available.");
			}
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
			<h1 className="page-title">Place Your Order</h1>
			<div className="content-box">
				{/* Product Summary */}
				<h2>Order Summary:</h2>
				<div className="product-summary">
					<h2>{initialTitle}</h2>
					<h3>{initialArtist}</h3>
					<p>Price: £{initialPrice}</p>
					{initialCoverImage && (
						<Image
							src={initialCoverImage}
							alt={initialTitle}
							width={200}
							height={200}
						/>
					)}
					<p>{initialDescription}</p>
				</div>

				{/* Shipping Form */}
				<form onSubmit={handleSubmit} className="form">
					<div>
						<label>Name:</label>
						<input
							type="text"
							name="name"
							value={orderData.name}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label>Email Address:</label>
						<input
							type="email"
							name="email"
							value={orderData.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label>Address 1:</label>
						<input
							type="text"
							name="address1"
							value={orderData.address1}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label>Address 2:</label>
						<input
							type="text"
							name="address2"
							value={orderData.address2}
							onChange={handleChange}
						/>
					</div>
					<div>
						<label>Address 3:</label>
						<input
							type="text"
							name="address3"
							value={orderData.address3}
							onChange={handleChange}
						/>
					</div>
					<div>
						<label>City/Town:</label>
						<input
							type="text"
							name="city"
							value={orderData.city}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label>Postcode:</label>
						<input
							type="text"
							name="postcode"
							value={orderData.postcode}
							onChange={handleChange}
							required
						/>
					</div>
					{error && <p style={{ color: "red" }}>{error}</p>}
					<button type="submit" disabled={loading}>
						{loading ? "Submitting..." : "Submit Order"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default PlaceOrder;
