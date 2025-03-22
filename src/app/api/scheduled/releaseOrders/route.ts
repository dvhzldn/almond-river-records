// src/app/api/scheduled/releaseOrders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "contentful-management";

// This endpoint should be triggered on a schedule (e.g., every 5 minutes).
// In production, replace the simulated orders below with a query to your orders data source,
// selecting orders that are older than 30 minutes and have not been processed (i.e. payment not completed).

export async function GET(_request: Request) {
	void _request; // explicitly mark _request as used

	try {
		// Simulated list of orders to release. Each order includes an orderId and an array of reserved record IDs.
		const ordersToRelease = [
			{
				orderId: "order123",
				recordIds: ["3PSN2a422rSNNtn3258eTG"],
				// In a real implementation, include a timestamp to filter orders older than 30 minutes.
			},
			{
				orderId: "order456",
				recordIds: ["recordId2", "recordId3"],
			},
		];

		if (ordersToRelease.length === 0) {
			return NextResponse.json({ message: "No orders to release" });
		}

		// Initialize the Contentful Management client
		const managementClient = createClient({
			accessToken: process.env
				.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN as string,
		});
		const space = await managementClient.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string
		);
		const environment = await space.getEnvironment(
			process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"
		);

		// Process each order and update every record to release the reserved item.
		const updateResults = await Promise.all(
			ordersToRelease.flatMap((order) =>
				order.recordIds.map(async (recordId: string) => {
					try {
						let entry = await environment.getEntry(recordId);
						// Release the item: mark as in stock and set quantity to 1.
						entry.fields.quantity = { "en-GB": 1 };
						entry.fields.inStock = { "en-GB": true };

						entry = await entry.update();
						await entry.publish();

						console.log(
							`Released record ${recordId} for order ${order.orderId}`
						);
						return { orderId: order.orderId, recordId, released: true };
					} catch (err: unknown) {
						if (err instanceof Error) {
							console.error(
								`Error releasing record ${recordId} for order ${order.orderId}:`,
								err
							);
							return {
								orderId: order.orderId,
								recordId,
								error: err.message,
							};
						}
						console.error(
							`Unknown error releasing record ${recordId} for order ${order.orderId}`
						);
						return {
							orderId: order.orderId,
							recordId,
							error: "Unknown error",
						};
					}
				})
			)
		);

		return NextResponse.json({ results: updateResults });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error in scheduled release:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
