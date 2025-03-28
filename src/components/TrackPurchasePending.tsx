"use client";
import { useEffect } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

export default function TrackPurchasePending() {
	const { track } = useAnalytics();

	useEffect(() => {
		track("purchase-pending");
	}, [track]);

	return null;
}
