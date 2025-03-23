// /app/api/sumup-webhook/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface OrderItem {
	vinyl_record_id: string;
}

// Update order status in Supabase orders table.
async function updateOrderStatus(orderReference: string, status: string) {
	// Here we assume your orders table uses the sumup_checkout_reference as a unique identifier.
	const { error } = await supabase
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
	// Assuming that the orders table's primary key is used in order_items as order_id,
	// and that you stored the sumup_checkout_reference in the orders table.
	// First, we need to fetch the order record from Supabase.
	const { data: orders, error: orderError } = await supabase
		.from("orders")
		.select("id")
		.eq("sumup_checkout_reference", orderReference)
		.single();

	if (orderError || !orders) {
		console.error("Error fetching order from Supabase:", orderError);
		throw orderError || new Error("Order not found");
	}

	const orderId = orders.id;

	const { data: orderItems, error: orderItemsError } = await supabase
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

// Release inventory by updating the quantity in Supabase vinyl_records table.
async function releaseInventory(recordIds: string[]) {
	await Promise.all(
		recordIds.map(async (recordId: string) => {
			const { error } = await supabase
				.from("vinyl_records")
				.update({ quantity: 1 })
				.eq("id", recordId);
			if (error) {
				console.error(
					`Error updating inventory for record ${recordId}:`,
					error
				);
			} else {
				console.log(`Released inventory for record ${recordId}`);
			}
		})
	);
}

export async function POST(request: Request) {
	try {
		// Parse incoming webhook payload from SumUp
		const payload = await request.json();
		console.log("Received SumUp webhook payload:", payload);

		// Simulated failure condition (for testing purposes)
		if (payload.id === "simulate-failed") {
			const checkoutDetails = {
				reference: "TEST-ORDER-FAILED",
				status: "FAILED",
			};
			console.log("Simulated checkout details:", checkoutDetails);

			await updateOrderStatus(checkoutDetails.reference, "FAILED");
			const recordIds = await getOrderItems(checkoutDetails.reference);
			await releaseInventory(recordIds);

			return NextResponse.json({}, { status: 200 });
		}

		// Process real SumUp webhook events.
		if (payload.event_type === "checkout.status.updated") {
			// In the new payload, checkout details are nested inside "payload"
			const checkoutDetails = payload.payload;
			console.log("Verified checkout details:", checkoutDetails);

			const orderReference: string = checkoutDetails.reference;
			const checkoutStatus: string = checkoutDetails.status;

			if (
				checkoutStatus === "PAID" ||
				checkoutStatus === "succeeded" ||
				checkoutStatus === "COMPLETED"
			) {
				await updateOrderStatus(orderReference, "PAID");
			} else if (checkoutStatus === "FAILED") {
				await updateOrderStatus(orderReference, "FAILED");
				const recordIds = await getOrderItems(orderReference);
				await releaseInventory(recordIds);
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
