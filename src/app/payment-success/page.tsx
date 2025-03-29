import { runFulfillment } from "@/lib/runFulfillment";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import ClearBasketOnSuccess from "@/components/ClearBasketOnSuccess";
import TrackPurchaseComplete from "@/components/TrackPurchaseComplete";
import TrackPurchaseFailed from "@/components/TrackPurchaseFailed";
import TrackPurchasePending from "@/components/TrackPurchasePending";
import { logOrderEvent } from "@/lib/logOrderEvent";

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
						If you require further assistance, please{" "}
						<Link href="/contact" className="hyperLink">
							send us a message
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

	// 1. Fetch the order from Supabase
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
					<p>
						Please{" "}
						<Link href="/contact" className="hyperLink">
							send us a message
						</Link>{" "}
						if this issue persists.
					</p>
				</div>
			</div>
		);
	}

	// 2. Fetch latest status from SumUp API
	const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
	if (!accessToken) {
		throw new Error("Missing SumUp API key");
	}

	const sumupUrl = `https://api.sumup.com/v0.1/checkouts/${order.sumup_id}`;
	const sumupResponse = await fetch(sumupUrl, {
		method: "GET",
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	const checkoutData = await sumupResponse.json();
	const checkoutStatus = checkoutData.status;

	console.log("payment-success: SumUp status =", checkoutStatus);

	// 3. Display appropriate message based on SumUp status
	if (checkoutStatus === "PENDING") {
		return <TrackPurchasePending />;
	}

	if (checkoutStatus === "FAILED") {
		return <TrackPurchaseFailed />;
	}

	if (checkoutStatus === "PAID") {
		// 4. If Supabase hasn't updated to PAID, fix it here
		if (order.sumup_status !== "PAID") {
			console.log("payment-success: Updating Supabase to PAID manually");
			await supabaseService
				.from("orders")
				.update({ sumup_status: "PAID" })
				.eq("sumup_checkout_reference", checkoutId);

			await logOrderEvent({
				event: "checkout-status-update",
				checkout_reference: checkoutId,
				message: "Status manually updated to PAID by payment-success",
				metadata: {
					from: order.sumup_status,
					to: "PAID",
					context: "payment-success fallback",
				},
			});
		}

		// 5. Fulfillment (includes email if not sent)
		try {
			await runFulfillment(checkoutId);
			console.log("payment-success: Fulfillment completed");
		} catch (err) {
			console.error("PaymentSuccess: Fulfillment failed", err);
		}

		// 6. UI confirmation
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
						<p>Order reference: {order.sumup_checkout_reference}</p>
					</div>
				</div>
			</>
		);
	}

	// 7. Unexpected state fallback
	return (
		<div className="page-container">
			<h1 className="page-title">Payment Status Unknown</h1>
			<div className="content-box">
				<p>We were unable to confirm your payment.</p>
				<p>
					Please{" "}
					<Link href="/contact" className="hyperLink">
						send us a message
					</Link>{" "}
					if this issue persists.
				</p>
			</div>
		</div>
	);
}
