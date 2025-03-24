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
	// add additional fields as needed
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
	cover_image: string; // asset ID stored in vinyl_records
}

interface Asset {
	id: string;
	url: string;
}

// Allow searchParams to be either an object or a Promise of one.
type PaymentSuccessProps = {
	searchParams:
		| { [key: string]: string | string[] }
		| Promise<{ [key: string]: string | string[] }>;
};

export default async function PaymentSuccess({
	searchParams,
}: PaymentSuccessProps) {
	// Await in case searchParams is a promise.
	const params = await Promise.resolve(searchParams);
	const checkoutId = Array.isArray(params.checkout_id)
		? params.checkout_id[0]
		: params.checkout_id;

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

	// Query the order in Supabase using the checkout reference.
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

	// Query order items for this order.
	const orderItemsRes = await supabase
		.from("order_items")
		.select("*")
		.eq("order_id", order.id);
	const orderItemsData = orderItemsRes.data as OrderItem[] | null;
	const orderItems: OrderItem[] = orderItemsData ?? [];

	// If order items exist, fetch cover image URLs from vinyl_records and contentful_assets.
	let orderItemsWithCover: OrderItem[] = [];
	if (orderItems.length > 0) {
		// Get the vinyl record IDs from order items.
		const recordIds = orderItems.map((item) => item.vinyl_record_id);

		// Query vinyl_records to get the cover_image asset IDs.
		const vinylRecordsRes = await supabase
			.from("vinyl_records")
			.select("id, cover_image")
			.in("id", recordIds);
		const vinylRecordsData = vinylRecordsRes.data as VinylRecord[] | null;
		const vinylRecords: VinylRecord[] = vinylRecordsData ?? [];

		// Build a mapping from vinyl_record_id to its cover_image asset ID.
		const vinylRecordMap: Record<string, string> = {};
		vinylRecords.forEach((v) => {
			vinylRecordMap[v.id] = v.cover_image;
		});

		// Get unique asset IDs.
		const assetIds = Array.from(new Set(Object.values(vinylRecordMap)));

		// Query contentful_assets to get the URL for each asset.
		const assetsRes = await supabase
			.from("contentful_assets")
			.select("id, url")
			.in("id", assetIds);
		const assetsData = assetsRes.data as Asset[] | null;
		const assets: Asset[] = assetsData ?? [];

		// Build a mapping from asset ID to URL.
		const assetMap: Record<string, string> = {};
		assets.forEach((asset) => {
			assetMap[asset.id] = asset.url;
		});

		// Augment each order item with its cover image URL.
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
									{item.artist_names.join(", ")} - {item.title}
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
