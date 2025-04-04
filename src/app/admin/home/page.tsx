"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
export default function AdminHomePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.replace("/login?redirectedFrom=/admin");
			}
			setLoading(false);
		};

		checkAuth();
	}, [router]);

	if (loading) return <p>Loading...</p>;

	return (
		<div className="page-container">
			<h1>Admin Dashboard</h1>

			<hr />
			<Link href="/admin/addrecord">➕ Add a new record</Link>
			<br />
			<Link href="/admin/manage-records">📦 Manage existing records</Link>
		</div>
	);
}
