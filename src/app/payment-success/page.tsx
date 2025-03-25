import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

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
}

interface OrderItem {
	order_id: string;
	vinyl_record_id: string;
	artist_names: string[];
	title: string;
	price: number;
	cover_image_url?: string | null;
}

interface VinylRecord {
	id: string;
	cover_image: string; // This is the ID in contentful_assets
}

interface Asset {
	id: string;
	url: string; // This is the actual image URL
}

export default async function PaymentSuccess({ params, searchParams }) {
	// Use params if needed (e.g. console.log(params)).
	void params;

	// Extract checkout_id from searchParams.
	const checkoutId = Array.isArray(searchParams.checkout_id)
		? searchParams.checkout_id[0]
		: searchParams.checkout_id;

	if (!checkoutId) {
		return (
			<div className="page-container">
				<h1 className="page-title">Order Incomplete</h1>
				<div className="content-box">
					<h4>Error: missing checkout reference.</h4>
					<br />
					<p>Something went wrong and your order has not been placed.</p>
					<br /> <br />
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

	// Retrieve the order details from the orders table.
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
					<p>Something went wrong with placing your order.</p>
					<br />
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

	// Only proceed if the payment status is "PAID".
	if (order.sumup_status !== "PAID") {
		return (
			<div className="page-container">
				<h1 className="page-title">Payment Incomplete</h1>
				<div className="content-box">
					<p>Your payment was not processed successfully.</p>
					<br />
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

	// If the order is PAID and email hasn't been sent yet, trigger sending confirmation email
	// if (!order.email_sent) {
	// 	// Call the API endpoint to send the confirmation email
	// 	await fetch(
	// 	  `${process.env.NEXT_PUBLIC_BASE_URL}/api/resend/sendConfirmationEmail`,
	// 	  {
	// 		method: "POST",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify({ checkoutId: order.sumup_checkout_reference })
	// 	  }
	// 	);
	//   }

	// Retrieve the order items for this order.
	const orderItemsRes = await supabaseService
		.from("order_items")
		.select("*")
		.eq("order_id", order.id);
	const orderItemsData = orderItemsRes.data as OrderItem[] | null;
	const orderItems: OrderItem[] = orderItemsData ?? [];

	// If there are order items, fetch the cover image URLs from contentful_assets.
	let orderItemsWithCover: OrderItem[] = [];
	if (orderItems.length > 0) {
		// 1) Get the vinyl record IDs from the order items.
		const recordIds = orderItems.map((item) => item.vinyl_record_id);

		// 2) Query vinyl_records to get the 'cover_image' (which is actually the asset ID).
		const vinylRecordsRes = await supabaseService
			.from("vinyl_records")
			.select("id, cover_image")
			.in("id", recordIds);

		const vinylRecordsData = vinylRecordsRes.data as VinylRecord[] | null;
		const vinylRecords: VinylRecord[] = vinylRecordsData ?? [];

		// 3) Build a map from vinyl_record_id -> cover_image (asset ID in contentful_assets).
		const vinylRecordMap: Record<string, string> = {};
		vinylRecords.forEach((record) => {
			vinylRecordMap[record.id] = record.cover_image;
		});

		// 4) Collect all unique asset IDs to fetch from contentful_assets.
		const assetIds = Array.from(new Set(Object.values(vinylRecordMap)));

		// 5) Query contentful_assets to get the URL for each asset ID.
		const assetsRes = await supabaseService
			.from("contentful_assets")
			.select("id, url")
			.in("id", assetIds);

		const assetsData = assetsRes.data as Asset[] | null;
		const assets: Asset[] = assetsData ?? [];

		// 6) Create a map from asset ID -> actual image URL.
		const assetMap: Record<string, string> = {};
		assets.forEach((asset) => {
			assetMap[asset.id] = asset.url;
		});

		// 7) Attach cover_image_url to each order item based on the mapping.
		orderItemsWithCover = orderItems.map((item) => ({
			...item,
			cover_image_url:
				assetMap[vinylRecordMap[item.vinyl_record_id]] || null,
		}));
	}

	return (
		<div className="page-container">
			<h1 className="page-title">Payment Successful</h1>
			<div className="content-box">
				<div className="two-column-layout text">
					<h2>Thank you for your purchase, {order.customer_name}!</h2>
					<h3>Order reference: {order.sumup_id}</h3>
					<p>
						Your order will be processed promptly and dispatched within
						two working days.
					</p>
					<p>
						If you require further assistance, please get in touch through{" "}
						<Link href="/contact" className="hyperLink">
							our contact form
						</Link>{" "}
						and we will get back to you.
					</p>
					<br />
					<p>We hope you enjoy your records and appreciate your custom!</p>
				</div>
				<div className="two-column-layout text">
					<h3>Ordered Items:</h3>
					{orderItemsWithCover.length > 0 ? (
						<ul>
							{orderItemsWithCover.map((item) => (
								<li key={item.vinyl_record_id}>
									{item.cover_image_url && (
										<Image
											src={item.cover_image_url}
											alt={`Cover image for ${item.title}`}
											width={100}
											height={100}
										/>
									)}
									<p>
										{item.artist_names.join(", ")} – {item.title}
									</p>
								</li>
							))}
						</ul>
					) : (
						<p></p>
					)}
				</div>
				<div>
					{" "}
					<hr />
					<Image
						className="logo"
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={200}
						height={200}
						priority
					/>
				</div>
			</div>
		</div>
	);
}
