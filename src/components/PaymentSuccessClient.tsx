"use client";
import Image from "next/image";
import dynamic from "next/dynamic";

const ClearBasketOnSuccess = dynamic(
	() => import("@/components/ClearBasketOnSuccess"),
	{ ssr: false }
);

const TrackPurchaseComplete = dynamic(
	() => import("@/components/TrackPurchaseComplete"),
	{ ssr: false }
);

interface Props {
	checkoutStatus: string;
	orderId: string;
	amount: number;
	reference: string;
}

export function PaymentSuccessClient({
	checkoutStatus,
	orderId,
	amount,
	reference,
}: Props) {
	return (
		<>
			<ClearBasketOnSuccess checkoutStatus={checkoutStatus} />
			<TrackPurchaseComplete orderId={orderId} amount={amount} />
			<div className="page-container">
				<h1 className="page-title">Order complete</h1>
				<div className="content-box">
					<h3>Thank you for your purchase!</h3>
					<p>Your order will be processed and dispatched soon.</p>
					<hr />
					<Image
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={200}
						height={200}
						sizes="(max-width: 768px) 100vw, 250px"
						quality={60}
						loading="lazy"
					/>
					<p>Order reference: {reference}</p>
				</div>
			</div>
		</>
	);
}
