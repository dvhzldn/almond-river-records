"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminIndexPage() {
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				router.replace("/admin/home");
			} else {
				router.replace("/login?redirectedFrom=/admin");
			}
		};

		checkAuth();
	}, [router]);

	return (
		<div className="page-container">
			<p>Checking admin status...</p>
		</div>
	);
}
