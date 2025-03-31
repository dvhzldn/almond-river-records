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

	useEffect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			if (!user) {
				router.replace("/login");
			} else {
				setAuthChecked(true);
			}
		});
	}, [router]);

	if (!authChecked) return null;

	return <>{children}</>;
}
