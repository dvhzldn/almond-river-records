"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	const router = useRouter();
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const response = await fetch("https://api.web3forms.com/submit", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				access_key: "1136990a-d70a-42f2-8fde-1e44fad8ee7f",
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				message: formData.message,
			}),
		});

		const result = await response.json();
		if (result.success) {
			alert(
				"Thanks for getting in touch. We will be back in touch promptly."
			);
			setFormData({ name: "", email: "", phone: "", message: "" });
			router.push("/");
		} else {
			alert("Message failed to send. Please try again.");
		}
	};

	return (
		<div className="page-container">
			<h1 className="page-title">Contact Us</h1>
			<div className="content-box">
				<div className="text">
					<p>
						Send a message through the form below and we will get back to
						you at our earliest convenience.
					</p>
					<br />
					<p>
						For any urgent enquiries, please call Andy on{" "}
						<a
							href="tel:+447729421682"
							className="hyperLink"
							target="_blank"
							rel="noopener noreferrer"
						>
							07729 421682
						</a>
						.
					</p>
				</div>
				<div>
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
				</div>
			</div>
		</div>
	);
}
