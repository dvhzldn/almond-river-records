import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import ClearBasketOnSuccess from "@/components/ClearBasketOnSuccess";

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
	// We're not using params.
	void params;
	// Extract checkoutId (the sumup_checkout_reference) from searchParams.
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
						If you require further assistance, please get in touch through{" "}
						<Link href="/contact" className="hyperLink">
							our contact form
						</Link>{" "}
						and we will get back to you.
					</p>
					<hr />
					<Image
						className="logo"
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={100}
						height={100}
						priority
					/>
				</div>
			</div>
		);
	}

	// Fetch the order details from Supabase using the checkout reference.
	const orderRes = await supabaseService
		.from("orders")
		.select("*")
		.eq("sumup_checkout_reference", checkoutId)
		.single();
	const order = orderRes.data as Order | null;
	if (orderRes.error || !order) {
		return (
			<div className="page-container">
				<h1 className="page-title">Payment Error</h1>
				<div className="content-box">
					<p>Something went wrong with retrieving your order details.</p>
					<p>
						Please contact support through{" "}
						<Link href="/contact" className="hyperLink">
							our contact form
						</Link>
						.
					</p>
					<hr />
					<Image
						className="logo"
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={100}
						height={100}
						priority
					/>
				</div>
			</div>
		);
	}

	// --- Step 1: Call the SumUp API with the sumup_id from the order record ---
	// Build the URL by appending order.sumup_id to the base URL.
	const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
	if (!accessToken) {
		throw new Error("Missing SumUp access token");
	}
	const sumupUrl = `https://api.sumup.com/v0.1/checkouts/${order.sumup_id}`;
	console.log("Fetching SumUp checkout status from:", sumupUrl);

	const sumupResponse = await fetch(sumupUrl, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	});
	console.log("SumUp status response status:", sumupResponse.status);
	if (!sumupResponse.ok) {
		const errorText = await sumupResponse.text();
		throw new Error(`Failed to fetch checkout status: ${errorText}`);
	}

	const checkoutData = await sumupResponse.json();
	const checkoutStatus = checkoutData.status;
	console.log("Fetched checkout status:", checkoutStatus);

	// --- Step 2: Render fallback messages based on checkoutStatus ---
	if (checkoutStatus === "PENDING") {
		return (
			<div className="page-container">
				<h1 className="page-title">Payment Pending</h1>
				<div className="content-box">
					<h4>Your order and payment is being processed.</h4>
					<p>Please wait a moment while we complete your order.</p>
				</div>
			</div>
		);
	} else if (checkoutStatus === "FAILED") {
		return (
			<div className="page-container">
				<h1 className="page-title">Payment Error</h1>
				<div className="content-box">
					<p>
						Your order has not been placed. Something went wrong with
						processing your payment.
					</p>
					<p>Please contact support or try again.</p>
					<hr />
					<Image
						className="logo"
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={100}
						height={100}
						priority
					/>
				</div>
			</div>
		);
	} else if (checkoutStatus === "PAID") {
		// --- Step 3: Trigger Fulfillment Endpoint (if necessary) ---
		if (!order.order_confirmation_email_sent) {
			try {
				const fulfillUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/fulfillOrder`;
				console.log("Triggering fulfillment endpoint at:", fulfillUrl);
				const fulfillRes = await fetch(fulfillUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						checkoutReference: order.sumup_checkout_reference,
					}),
				});
				if (!fulfillRes.ok) {
					console.error(
						"Error triggering fulfillment endpoint:",
						await fulfillRes.text()
					);
				} else {
					console.log("Fulfillment endpoint triggered successfully");
				}
			} catch (err) {
				console.error("Error calling fulfillment endpoint:", err);
			}
		}

		// --- Step 5: Render Order Success UI ---
		return (
			<>
				<ClearBasketOnSuccess checkoutStatus={checkoutStatus} />

				<div className="page-container">
					<h1 className="page-title">Order complete</h1>
					<div className="content-box">
						<h3>Thank you for your purchase!</h3>
						<br />
						<p>
							Your order will be processed promptly and dispatched within
							two working days.
						</p>
						<br />
						<div>
							<div>
								<p>
									If you require further assistance, please get in
									touch through{" "}
									<Link href="/contact" className="hyperLink">
										our contact form
									</Link>{" "}
									and we will get back to you.
								</p>
							</div>
						</div>
						<div>
							<hr />
							<Image
								className="logo"
								src="/images/almond-river-logo.jpg"
								alt="Almond River Records logo"
								width={200}
								height={200}
								priority
							/>
							<p>Order reference: {order.sumup_id}</p>
						</div>
					</div>
				</div>
			</>
		);
	} else {
		// If checkoutStatus is not one of the expected values.
		return (
			<div className="page-container">
				<h1 className="page-title">Payment Status Unknown</h1>
				<div className="content-box">
					<h4>Your payment has not been processed.</h4>
					<p>
						Unable to determine your payment status. Please contact
						support.
					</p>
					<p>
						If you require further assistance, please get in touch through{" "}
						<Link href="/contact" className="hyperLink">
							our contact form
						</Link>{" "}
						and we will get back to you.
					</p>
					<hr />
					<Image
						className="logo"
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={100}
						height={100}
						priority
					/>
				</div>
			</div>
		);
	}
}
