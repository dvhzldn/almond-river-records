"use client";

import dynamic from "next/dynamic";

const PaymentSuccessClient = dynamic(() => import("./PaymentSuccessClient"), {
	ssr: false,
});

export default function PaymentSuccess() {
	return (
		<div>
			<PaymentSuccessClient />
		</div>
	);
}
