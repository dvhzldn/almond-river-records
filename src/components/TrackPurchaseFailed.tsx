"use client";
import { useEffect } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

export default function TrackPurchaseFailed() {
	const { track } = useAnalytics();

	useEffect(() => {
		track("purchase-failed");
	}, [track]);

	return null;
}
