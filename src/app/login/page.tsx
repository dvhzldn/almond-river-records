"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Script from "next/script";

declare global {
	interface Window {
		turnstile?: {
			reset: () => void;
		};
	}
}

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const token = (
			document.querySelector(
				'[name="cf-turnstile-response"]'
			) as HTMLInputElement
		)?.value;

		if (!token) {
			setError("Captcha verification failed. Please try again.");
			setLoading(false);
			return;
		}

		console.log("[Login Attempt]", { email });

		const { error, data } = await supabase.auth.signInWithPassword({
			email,
			password,
			options: {
				captchaToken: token,
			},
		});

		// Always reset the widget after a login attempt
		if (window.turnstile) {
			window.turnstile.reset();
		}

		if (error) {
			console.error("[Login Error]", error);
			setError(error.message);
		} else {
			console.log("[Login Success]", data);

			const redirectedFrom =
				searchParams.get("redirectedFrom") || "/admin/home";
			router.replace(redirectedFrom);
		}

		setLoading(false);
	};

	return (
		<>
			<div className="page-container">
				<h1 className="page-title">Admin</h1>
				<form onSubmit={handleLogin} className="form">
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<div
						className="cf-turnstile"
						data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
					></div>

					<button type="submit" disabled={loading} className="form-button">
						{loading ? "Logging in..." : "Login"}
					</button>

					{error ? <p className="error-text">{error}</p> : null}
				</form>
			</div>

			<Script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js"
				defer
			/>
		</>
	);
}
