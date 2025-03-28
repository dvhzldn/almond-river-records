import { runFulfillment } from "@/lib/runFulfillment";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import ClearBasketOnSuccess from "@/components/ClearBasketOnSuccess";
import TrackPurchaseComplete from "@/components/TrackPurchaseComplete";
import TrackPurchaseFailed from "@/components/TrackPurchaseFailed";
import TrackPurchasePending from "@/components/TrackPurchasePending";

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Order {
	id: string;
	customer_name: string;
	order_date: string;
	sumup_checkout_reference: string;
	sumup_id: string;
	sumup_amount: number;
	sumup_status: string;
	order_confirmation_email_sent: boolean;
}

export default async function PaymentSuccess({ params, searchParams }) {
	void params;

	const checkoutId = Array.isArray(searchParams.checkout_id)
		? searchParams.checkout_id[0]
		: searchParams.checkout_id;

	if (!checkoutId) {
		return (
			<div className="page-container">
				<h1 className="page-title">Order Incomplete</h1>
				<div className="content-box">
					<h4>Error: missing checkout reference.</h4>
					<p>Something went wrong and your order has not been placed.</p>
					<p>
						If you require further assistance, please contact{" "}
						<Link href="/contact" className="hyperLink">
							support
						</Link>
						.
					</p>
					<hr />
					<Image
						src="/images/almond-river-logo.jpg"
						alt="Logo"
						width={100}
						height={100}
						priority
					/>
				</div>
			</div>
		);
	}

	const { data: order, error } = await supabaseService
		.from("orders")
		.select("*")
		.eq("sumup_checkout_reference", checkoutId)
		.single<Order>();

	if (error || !order) {
		return (
			<div className="page-container">
				<h1 className="page-title">Payment Error</h1>
				<div className="content-box">
					<p>Could not retrieve your order. Please contact support.</p>
				</div>
			</div>
		);
	}

	const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
	const sumupUrl = `https://api.sumup.com/v0.1/checkouts/${order.sumup_id}`;

	const sumupResponse = await fetch(sumupUrl, {
		method: "GET",
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	const checkoutData = await sumupResponse.json();
	const checkoutStatus = checkoutData.status;

	if (checkoutStatus === "PENDING") {
		return <TrackPurchasePending />;
	}

	if (checkoutStatus === "FAILED") {
		return <TrackPurchaseFailed />;
	}

	if (checkoutStatus === "PAID") {
		if (!order.order_confirmation_email_sent) {
			const maxRetries = 5;
			const delay = 300;
			let retries = 0;
			let paid = false;

			while (retries < maxRetries) {
				const { data: refreshed, error: fetchError } = await supabaseService
					.from("orders")
					.select("sumup_status")
					.eq("sumup_checkout_reference", order.sumup_checkout_reference)
					.single();

				if (fetchError) {
					console.warn("PaymentSuccess: Retry fetch error:", fetchError);
				}

				if (refreshed?.sumup_status === "PAID") {
					paid = true;
					break;
				}

				await new Promise((r) => setTimeout(r, delay));
				retries++;
			}

			if (paid) {
				try {
					await runFulfillment(order.sumup_checkout_reference);
				} catch (err) {
					console.error("PaymentSuccess: Fulfillment failed", err);
				}
			} else {
				console.warn("PaymentSuccess: Supabase never reached PAID status.");
			}
		}

		return (
			<>
				<ClearBasketOnSuccess checkoutStatus={checkoutStatus} />
				<TrackPurchaseComplete
					orderId={order.id}
					amount={order.sumup_amount}
				/>
				<div className="page-container">
					<h1 className="page-title">Order complete</h1>
					<div className="content-box">
						<h3>Thank you for your purchase!</h3>
						<p>Your order will be processed and dispatched soon.</p>
						<hr />
						<Image
							src="/images/almond-river-logo.jpg"
							alt="Logo"
							width={200}
							height={200}
							priority
						/>
						<p>Order reference: {order.sumup_id}</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<div className="page-container">
			<h1 className="page-title">Payment Status Unknown</h1>
			<div className="content-box">
				<p>We were unable to confirm your payment.</p>
				<p>
					Please contact{" "}
					<Link href="/contact" className="hyperLink">
						support
					</Link>{" "}
					if this issue persists.
				</p>
			</div>
		</div>
	);
}
