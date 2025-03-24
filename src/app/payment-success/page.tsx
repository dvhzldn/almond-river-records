// /app/payment-success/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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
				<h1 className="page-title">Payment Error</h1>
				<div className="content-box">
					<p>Error: Missing checkout reference.</p>
				</div>
			</div>
		);
	}

	// Retrieve the order details from the orders table.
	const orderRes = await supabase
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
					<p>Error: Unable to retrieve order details.</p>
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
					<p>Your payment was not completed successfully.</p>
					<p>Please try again or contact support.</p>
				</div>
			</div>
		);
	}

	// Retrieve the order items for this order.
	const orderItemsRes = await supabase
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
		const vinylRecordsRes = await supabase
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
		const assetsRes = await supabase
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
				<h2>Thank you for your purchase, {order.customer_name}!</h2>
				<p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
				<p>Order Reference: {order.sumup_checkout_reference}</p>
				<p>Payment ID: {order.sumup_id}</p>
				<p>Total Amount: £{order.sumup_amount}</p>

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
					<p>No ordered items found.</p>
				)}
			</div>
		</div>
	);
}
