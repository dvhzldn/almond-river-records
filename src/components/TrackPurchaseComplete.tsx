"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

type Props = {
	orderId: string;
	amount: number;
};

export default function TrackPurchaseComplete({ orderId, amount }: Props) {
	const { track } = useAnalytics();

	useEffect(() => {
		track("purchase-complete", {
			orderId,
			amount,
		});
	}, [track, orderId, amount]);

	return null;
}
