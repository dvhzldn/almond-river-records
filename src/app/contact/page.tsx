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
		console.log(formData);
		alert("Message sent!");
		setFormData({ name: "", email: "", message: "" });
	};

	return (
		<>
			<h1>Contact Us</h1>
			<div className="map">
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.2716520508266!2d-3.292032172948193!3d55.943045299878484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c707d04ceedd%3A0xbbb0601c0f2583d!2sAlmond%20River%20Records!5e0!3m2!1sen!2suk!4v1741922054158!5m2!1sen!2suk"
					allowFullScreen
					loading="lazy"
				></iframe>
			</div>
			<p>253 St. John’s Road, Corstorphine, Edinburgh, EH12 7XD</p>
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

				<label htmlFor="message">Message:</label>
				<textarea
					id="message"
					name="message"
					value={formData.message}
					onChange={handleChange}
					required
					rows={5}
				/>

				<button type="submit">Send Message</button>
			</form>
		</>
	);
}
