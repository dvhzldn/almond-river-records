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
			<div className="map">
				<iframe
					width="90%"
					height="250"
					style={{ border: 0 }}
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.2716520508266!2d-3.292032172948193!3d55.943045299878484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c707d04ceedd%3A0xbbb0601c0f2583d!2sAlmond%20River%20Records!5e0!3m2!1sen!2suk!4v1741922054158!5m2!1sen!2suk"
					allowFullScreen
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
				></iframe>
			</div>
			<p>253 St. John’s Road</p>
			<p>Corstorphine</p>
			<p>Edinburgh</p>
			<p>EH12 7XD</p>
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
