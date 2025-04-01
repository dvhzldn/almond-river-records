"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import React from "react";

const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default function Analytics(): React.ReactElement | null {
	const pathname = usePathname();

	const isExcludedPath =
		pathname.startsWith("/admin") || pathname.startsWith("/login");

	if (isExcludedPath) {
		return null;
	}

	if (!UMAMI_SCRIPT_URL || !UMAMI_WEBSITE_ID) {
		console.warn("Umami env vars not set");
		return null;
	}

	return (
		<Script
			src={UMAMI_SCRIPT_URL}
			data-website-id={UMAMI_WEBSITE_ID}
			strategy="afterInteractive"
		/>
	);
}
