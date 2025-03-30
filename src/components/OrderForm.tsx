"use client";
import React, { useState, useRef, useEffect } from "react";

export interface OrderData {
	name: string;
	email: string;
	address1: string;
	address2: string;
	address3: string;
	city: string;
	postcode: string;
}

interface OrderFormProps {
	onSubmit: (orderData: OrderData) => Promise<void>;
	loading: boolean;
	error: string | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, loading, error }) => {
	const [orderData, setOrderData] = useState<OrderData>({
		name: "",
		email: "",
		address1: "",
		address2: "",
		address3: "",
		city: "",
		postcode: "",
	});

	const errorRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (error) {
			errorRef.current?.focus();
		}
	}, [error]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOrderData({
			...orderData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await onSubmit(orderData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="order-form"
			aria-describedby={error ? "order-error" : undefined}
		>
			<fieldset>
				<legend>Contact information:</legend>

				<div>
					<label htmlFor="name">Name:</label>
					<input
						id="name"
						name="name"
						type="text"
						autoComplete="name"
						value={orderData.name}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="email">Email Address:</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						value={orderData.email}
						onChange={handleChange}
						required
					/>
				</div>
			</fieldset>

			<fieldset>
				<legend>Shipping information:</legend>

				<div>
					<label htmlFor="address1">Address 1:</label>
					<input
						id="address1"
						name="address1"
						type="text"
						autoComplete="address-line1"
						value={orderData.address1}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="address2">Address 2:</label>
					<input
						id="address2"
						name="address2"
						type="text"
						autoComplete="address-line2"
						value={orderData.address2}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="address3">Address 3:</label>
					<input
						id="address3"
						name="address3"
						type="text"
						value={orderData.address3}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="city">City/Town:</label>
					<input
						id="city"
						name="city"
						type="text"
						autoComplete="address-level2"
						value={orderData.city}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="postcode">Postcode:</label>
					<input
						id="postcode"
						name="postcode"
						type="text"
						autoComplete="postal-code"
						value={orderData.postcode}
						onChange={handleChange}
						required
					/>
				</div>
			</fieldset>

			{error && (
				<p
					ref={errorRef}
					id="order-error"
					role="alert"
					aria-live="assertive"
					tabIndex={-1}
					style={{ color: "red" }}
				>
					{error}
				</p>
			)}

			<br />

			<button type="submit" className="order-button" disabled={loading}>
				{loading ? "Submitting..." : "Go to payment"}
			</button>
		</form>
	);
};

export default OrderForm;
