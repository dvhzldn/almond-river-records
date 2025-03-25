import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/resendClient";
import { createClient } from "@supabase/supabase-js";

interface OrderItem {
	vinyl_record_id: string;
}

const supabaseService = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update order status in Supabase orders table.
async function updateOrderStatus(orderReference: string, status: string) {
	const { error } = await supabaseService
		.from("orders")
		.update({ sumup_status: status })
		.eq("sumup_checkout_reference", orderReference);
	if (error) {
		console.error("Error updating order status in Supabase:", error);
		throw error;
	}
	console.log(
		`Updated order ${orderReference} status to ${status} in Supabase.`
	);
}

// Retrieve vinyl record IDs associated with the order from the order_items table.
async function getOrderItems(orderReference: string): Promise<string[]> {
	const { data: orders, error: orderError } = await supabaseService
		.from("orders")
		.select("id")
		.eq("sumup_checkout_reference", orderReference)
		.single();

	if (orderError || !orders) {
		console.error("Error fetching order from Supabase:", orderError);
		throw orderError || new Error("Order not found");
	}

	const orderId = orders.id;

	const { data: orderItems, error: orderItemsError } = await supabaseService
		.from("order_items")
		.select("vinyl_record_id")
		.eq("order_id", orderId);

	if (orderItemsError || !orderItems) {
		console.error(
			"Error fetching order items from Supabase:",
			orderItemsError
		);
		throw orderItemsError || new Error("No order items found");
	}

	return (orderItems as OrderItem[]).map(
		(item: OrderItem) => item.vinyl_record_id
	);
}

// Update inventory by setting the quantity to 0 for PAID orders.
async function updateInventoryForPaid(recordIds: string[]) {
	await Promise.all(
		recordIds.map(async (recordId: string) => {
			const { error } = await supabaseService
				.from("vinyl_records")
				.update({ quantity: 0 })
				.eq("id", recordId);
			if (error) {
				console.error(
					`Error updating inventory for record ${recordId}:`,
					error
				);
			} else {
				console.log(`Inventory updated to 0 for record ${recordId}`);
			}
		})
	);
}

export async function POST(request: Request) {
	try {
		const payload = await request.json();
		console.log("Received SumUp webhook payload:", payload);

		if (payload.event_type === "checkout.status.updated") {
			const checkoutDetails = payload.payload;
			console.log("Verified checkout details:", checkoutDetails);

			const orderReference: string = checkoutDetails.reference;
			const checkoutStatus: string = checkoutDetails.status;

			if (
				checkoutStatus === "PAID" ||
				checkoutStatus === "succeeded" ||
				checkoutStatus === "COMPLETED"
			) {
				// Update order status and inventory for PAID orders.
				await updateOrderStatus(orderReference, "PAID");
				const recordIds = await getOrderItems(orderReference);
				await updateInventoryForPaid(recordIds);

				// --- New Code for Sending the Email ---
				// Fetch the complete order details (make sure orders table has the required fields)
				const { data: orderData, error: orderError } = await supabaseService
					.from("orders")
					.select("*")
					.eq("sumup_checkout_reference", orderReference)
					.single();

				if (orderError || !orderData) {
					console.error("Error fetching order details:", orderError);
					throw orderError || new Error("Order not found");
				}

				// Fetch the associated order items (ensure these include the necessary fields)
				const { data: orderItemsData, error: orderItemsError } =
					await supabaseService
						.from("order_items")
						.select("*")
						.eq("order_id", orderData.id);

				if (orderItemsError || !orderItemsData) {
					console.error("Error fetching order items:", orderItemsError);
					throw orderItemsError || new Error("Order items not found");
				}

				// Send the order confirmation email.
				await sendOrderConfirmationEmail(orderData, orderItemsData);
				// --- End New Code ---
			} else if (checkoutStatus === "FAILED") {
				await updateOrderStatus(orderReference, "FAILED");
			} else {
				await updateOrderStatus(orderReference, "PENDING");
			}
		}

		// Return a 200 OK response as required by SumUp.
		return NextResponse.json({}, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error processing SumUp webhook:", error);
			return NextResponse.json(
				{ error: "Server error", details: error.message },
				{ status: 500 }
			);
		} else {
			console.error("Unexpected error:", error);
			return NextResponse.json(
				{ error: "Server error", details: "An unexpected error occurred." },
				{ status: 500 }
			);
		}
	}
}
