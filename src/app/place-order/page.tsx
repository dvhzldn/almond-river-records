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
		const params = new URLSearchParams(window.location.search);
		setSearchParams(params);
	}, []);

	// Use "recordIds" (plural) if available; otherwise fallback to "recordId"
	const initialRecordIds =
		searchParams?.get("recordIds") || searchParams?.get("recordId") || "";
	const recordIds = initialRecordIds
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);

	// For cover images, use "coverImages" if available; otherwise fallback to "coverImage"
	const initialCoverImages =
		searchParams?.get("coverImages") || searchParams?.get("coverImage") || "";
	const coverImages = initialCoverImages
		.split(",")
		.map((url) => url.trim())
		.filter(Boolean);

	const initialPrice = Number(searchParams?.get("price")) || 0;
	const initialDescription = searchParams?.get("description") || "";
	const initialTitle = searchParams?.get("title") || "";
	const initialArtist = searchParams?.get("artist") || "";
	// const initialOrderStatus = "PENDING";

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
			const response = await fetch("/api/processOrder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: initialPrice,
					description: initialDescription, // full, detailed description
					recordIds, // record IDs
					orderData, // customer details
					initialTitle,
					initialArtist,
				}),
			});
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

	return (
		<div className="page-container">
			<h1 className="page-title">Place Your Order</h1>
			<div className="content-box">
				<h2>Order Summary:</h2>
				{/* Display all cover images */}
				<div className="cover-images">
					{coverImages.map((url, index) => (
						<Image
							key={index}
							src={url}
							alt={`Cover image ${index + 1}`}
							width={200}
							height={200}
						/>
					))}
				</div>
				<div className="product-summary">
					<h3>{initialDescription}</h3>
					<h4>Price: £{initialPrice}</h4>
				</div>
				<div>
					<p>Enter your details for postage.</p>
					<p>
						Your order will be dispatched promptly and should arrive
						within 3 to 5 working days.
					</p>
				</div>
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
						{loading ? "Submitting..." : "Go to payment"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default PlaceOrder;
