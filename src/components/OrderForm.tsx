"use client";
import React, { useState } from "react";

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
		<div>
			<form onSubmit={handleSubmit} className="order-form">
				<h4>Contact:</h4>
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
				<h4>Shipping:</h4>
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
				<br />
				<button className="order-button" type="submit" disabled={loading}>
					{loading ? "Submitting..." : "Go to payment"}
				</button>
			</form>
		</div>
	);
};

export default OrderForm;
