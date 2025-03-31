// File: app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		console.log("[Login Attempt]", { email });

		const { error, data } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("[Login Error]", error);
			setError(error.message);
		} else {
			console.log("[Login Success]", data);
			const session = await supabase.auth.getSession();
			console.log("[Session]", session);
			router.replace("/admin/home");
		}

		setLoading(false);
	};

	return (
		<div className="form">
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

				<button type="submit" disabled={loading} className="form-button">
					{loading ? "Logging in..." : "Login"}
				</button>
				{error ? <p className="error-text">{error}</p> : null}
			</form>
		</div>
	);
}
