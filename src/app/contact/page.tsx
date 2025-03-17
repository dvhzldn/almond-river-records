"use client";
import { useState } from "react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log(formData);
		alert("Message sent!");
		setFormData({ name: "", email: "", phone: "", message: "" });
	};

	return (
		<section className="section">
			<h1>Contact Us</h1>
			<section>
				<form onSubmit={handleSubmit} className="form">
					<label htmlFor="name">Name:</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
					/>

					<label htmlFor="email">Email:</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
					/>

					<label htmlFor="phone">Phone:</label>
					<input
						type="text"
						id="phone"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						required
					/>

					<label htmlFor="message">Message:</label>
					<textarea
						id="message"
						name="message"
						value={formData.message}
						onChange={handleChange}
						required
						rows={5}
					/>

					<button type="submit">Send</button>
				</form>
			</section>
		</section>
	);
}
