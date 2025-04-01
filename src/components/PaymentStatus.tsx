"use client";

import dynamic from "next/dynamic";

const TrackPurchasePending = dynamic(() => import("./TrackPurchasePending"), {
	ssr: false,
});

const TrackPurchaseFailed = dynamic(() => import("./TrackPurchaseFailed"), {
	ssr: false,
});

interface Props {
	status: "PENDING" | "FAILED";
}

export function PaymentStatus({ status }: Props) {
	if (status === "PENDING") return <TrackPurchasePending />;
	if (status === "FAILED") return <TrackPurchaseFailed />;
	return null;
}
