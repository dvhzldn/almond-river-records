"use client";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [authChecked, setAuthChecked] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const checkUser = async () => {
			const { data, error } = await supabase.auth.getUser();

			if (!isMounted) return;

			if (error || !data?.user) {
				router.replace("/login");
			} else {
				setAuthChecked(true);
			}
			setLoading(false);
		};

		checkUser();

		return () => {
			isMounted = false;
		};
	}, [router]);

	if (loading || !authChecked) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p>Checking authentication...</p>
			</div>
		);
	}

	return <>{children}</>;
}
