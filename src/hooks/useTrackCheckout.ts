"use client";

import { useCallback } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

export function useTrackCheckout() {
	const { track } = useAnalytics();

	return useCallback(
		(data: { artistTitle: string; artists: string; titles: string }) => {
			track("checkout-started", data);
		},
		[track]
	);
}
