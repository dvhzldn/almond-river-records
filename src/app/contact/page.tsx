"use client";

import { useState } from "react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Add your form submission logic here (e.g., call an API endpoint)
		console.log(formData);
		alert("Message sent!");
		setFormData({ name: "", email: "", message: "" });
	};

	return (
		<main style={{ padding: "1rem" }}>
			<h1>Contact Us</h1>
			<form
				onSubmit={handleSubmit}
				style={{ maxWidth: "500px", margin: "0 auto" }}
			>
				<div style={{ marginBottom: "1rem" }}>
					<label htmlFor="name">Name:</label>
					<br />
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						style={{ width: "100%", padding: "0.5rem" }}
					/>
				</div>
				<div style={{ marginBottom: "1rem" }}>
					<label htmlFor="email">Email:</label>
					<br />
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						style={{ width: "100%", padding: "0.5rem" }}
					/>
				</div>
				<div style={{ marginBottom: "1rem" }}>
					<label htmlFor="message">Message:</label>
					<br />
					<textarea
						id="message"
						name="message"
						value={formData.message}
						onChange={handleChange}
						required
						rows={5}
						style={{ width: "100%", padding: "0.5rem" }}
					></textarea>
				</div>
				<button type="submit" style={{ padding: "0.5rem 1rem" }}>
					Send Message
				</button>
			</form>
		</main>
	);
}
