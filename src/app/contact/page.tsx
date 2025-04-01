"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
	const router = useRouter();

	const [formData, setFormData] = useState({
		full_name: "",
		contact_email: "",
		phone_number: "",
		user_message: "",
		website: "",
		csrf_token: "",
	});
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [submitting, setSubmitting] = useState(false);
	const [canSubmit, setCanSubmit] = useState(false);

	// Delay submission to prevent bots
	useEffect(() => {
		const timer = setTimeout(() => setCanSubmit(true), 2000);
		return () => clearTimeout(timer);
	}, []);

	// CSRF token generation
	useEffect(() => {
		const token = crypto.randomUUID();
		localStorage.setItem("csrf_token", token);
		setFormData((prev) => ({ ...prev, csrf_token: token }));
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const sanitize = (str: string): string =>
		str
			.replace(/<[^>]*>?/gm, "")
			.trim()
			.slice(0, 500);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Rate limiting
		const lastSent = localStorage.getItem("lastContactTime");
		if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
			alert("Please wait a moment before submitting again.");
			return;
		}

		if (formData.website) {
			console.warn("Bot detected (honeypot triggered)");
			setStatus("success");
			return;
		}

		const localToken = localStorage.getItem("csrf_token");
		if (!localToken || formData.csrf_token !== localToken) {
			alert("Security token mismatch. Please reload the form.");
			return;
		}

		if (
			formData.user_message.length < 10 ||
			!/([aeiou])/.test(formData.user_message)
		) {
			alert("Please enter a valid message.");
			return;
		}

		setSubmitting(true);

		const sanitized = {
			full_name: sanitize(formData.full_name),
			contact_email: sanitize(formData.contact_email),
			phone_number: sanitize(formData.phone_number),
			user_message: sanitize(formData.user_message),
			website: "",
			csrf_token: formData.csrf_token,
		};

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(sanitized),
			});

			if (res.ok) {
				window.scrollTo({ top: 0, behavior: "smooth" });
				setFormData({
					full_name: "",
					contact_email: "",
					phone_number: "",
					user_message: "",
					website: "",
					csrf_token: "",
				});
				localStorage.setItem("lastContactTime", Date.now().toString());
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

					<form
						onKeyDown={(e) => {
							if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
								e.preventDefault();
							}
						}}
						onSubmit={handleSubmit}
						className="form"
						noValidate
					>
						<input
							type="hidden"
							name="csrf_token"
							value={formData.csrf_token}
						/>
						<label htmlFor="full_name">Name:</label>
						<input
							type="text"
							id="full_name"
							name="full_name"
							value={formData.full_name}
							onChange={handleChange}
							required
							minLength={3}
							autoComplete="name"
							inputMode="text"
							aria-required="true"
							aria-invalid={formData.full_name === "" ? "true" : "false"}
							placeholder="Enter your name"
							autoCapitalize="words"
						/>
						<label htmlFor="contact_email">Email:</label>
						<input
							type="email"
							id="contact_email"
							name="contact_email"
							value={formData.contact_email}
							onChange={handleChange}
							required
							minLength={5}
							autoComplete="email"
							inputMode="email"
							aria-required="true"
							aria-invalid={
								formData.contact_email === "" ? "true" : "false"
							}
							placeholder="Enter your email address"
							pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
						/>
						<label htmlFor="phone_number">Phone (optional):</label>
						<input
							type="tel"
							id="phone_number"
							name="phone_number"
							value={formData.phone_number}
							onChange={handleChange}
							autoComplete="tel"
							inputMode="tel"
							placeholder="Contact number if you would like a call back."
						/>
						<label htmlFor="user_message">Message:</label>
						<textarea
							id="user_message"
							name="user_message"
							value={formData.user_message}
							onChange={handleChange}
							required
							rows={6}
							inputMode="text"
							aria-required="true"
							aria-invalid={
								formData.user_message.length < 10 ? "true" : "false"
							}
							placeholder="Message should be at least 10 characters long."
							minLength={10}
						/>
						{/* Honeypot (hidden) */}
						<input
							type="text"
							name="website"
							value={formData.website}
							onChange={handleChange}
							style={{ display: "none" }}
							autoComplete="off"
							tabIndex={-1}
						/>
						<button disabled={!canSubmit || submitting}>
							{submitting
								? "Sending..."
								: status === "success"
									? "Sent!"
									: "Send"}
						</button>
						{status !== "idle" && (
							<div role="status" aria-live="polite">
								{status === "success" && (
									<p className="success-text">
										✅ Message sent successfully!
									</p>
								)}
								{status === "error" && (
									<p className="error-text">
										❌ Something went wrong. Please try again.
									</p>
								)}
							</div>
						)}
					</form>
				</section>
			</div>
		</div>
	);
}
