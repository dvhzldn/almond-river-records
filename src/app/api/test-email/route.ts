// /app/api/test-email/route.ts
import { NextResponse } from "next/server";
import {
	sendOrderConfirmationEmail,
	Order,
	OrderItem,
} from "@/lib/resendClient";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: Request) {
	// Dummy order data that matches your Order interface.
	const testOrder: Order = {
		id: "order_test_123",
		customer_name: "Dave Hazeldean",
		customer_email: "davehazeldean@gmail.com",
		order_date: new Date().toISOString(),
		sumup_checkout_reference: "test-checkout-ref",
		sumup_id: "test-sumup-id",
		sumup_amount: 29.99,
		address1: "123 Main Street",
		address2: "Apt 4B",
		address3: "",
		city: "Anytown",
		postcode: "12345",
	};

	// Dummy order items.
	const testOrderItems: OrderItem[] = [
		{
			vinyl_record_id: "record1",
			artist_names: ["Artist A"],
			title: "Record Title A",
			price: 19.99,
		},
		{
			vinyl_record_id: "record2",
			artist_names: ["Artist B", "Artist C"],
			title: "Record Title B",
			price: 9.99,
		},
	];

	try {
		// Send the email.
		await sendOrderConfirmationEmail(testOrder, testOrderItems);
		return NextResponse.json({ message: "Test email sent successfully." });
	} catch (error: unknown) {
		console.error("Error sending test email:", error);
		return NextResponse.json(
			{ error: "Error sending test email." },
			{ status: 500 }
		);
	}
}
