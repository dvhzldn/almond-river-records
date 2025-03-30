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
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [submitting, setSubmitting] = useState(false);

	const router = useRouter();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const response = await fetch("https://api.web3forms.com/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					access_key: "1136990a-d70a-42f2-8fde-1e44fad8ee7f",
					...formData,
				}),
			});

			const result = await response.json();
			if (result.success) {
				setFormData({ name: "", email: "", phone: "", message: "" });
				setStatus("success");
				setTimeout(() => router.push("/"), 3000);
			} else {
				setStatus("error");
			}
		} catch (err) {
			console.error(err);
			setStatus("error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="page-container">
			<h1 className="page-title">Contact Us</h1>

			<div className="content-box">
				<section aria-labelledby="contact-form-heading">
					<h2 id="contact-form-heading">Send us a message</h2>

					<form onSubmit={handleSubmit} className="form" noValidate>
						<label htmlFor="name">Name:</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							aria-required="true"
							autoComplete="name"
						/>

						<label htmlFor="email">Email:</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							aria-required="true"
							autoComplete="email"
							inputMode="email"
						/>

						<label htmlFor="phone">Phone:</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							required
							aria-required="true"
							autoComplete="tel"
							inputMode="tel"
						/>

						<label htmlFor="message">Message:</label>
						<textarea
							id="message"
							name="message"
							value={formData.message}
							onChange={handleChange}
							required
							aria-required="true"
							rows={5}
						/>

						<button type="submit" disabled={submitting}>
							{submitting ? "Sending..." : "Send"}
						</button>

						{status !== "idle" && (
							<>
								{/* Visible message */}
								<div
									className={`form-status ${status}`}
									role="status"
									aria-live="polite"
								>
									{status === "success"
										? "Thanks for getting in touch. Redirecting to homepage..."
										: "Message failed to send. Please try again."}
								</div>

								{/* SR-only duplicate for assistive tech (in case visual one is styled away) */}
								<div
									className="sr-only"
									aria-live="polite"
									role="status"
								>
									{status === "success"
										? "Thanks for getting in touch. Redirecting to homepage..."
										: "Message failed to send. Please try again."}
								</div>
							</>
						)}
					</form>
				</section>
			</div>
		</div>
	);
}
