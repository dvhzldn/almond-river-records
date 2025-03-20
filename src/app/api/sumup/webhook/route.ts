import { NextResponse } from "next/server";
import { createClient } from "contentful-management";

export async function POST(request: Request) {
	try {
		// Parse incoming webhook payload
		const payload = await request.json();
		console.log("Received webhook payload:", payload);

		if (payload.event_type === "CHECKOUT_STATUS_CHANGED") {
			const checkoutId = payload.id;

			const accessToken = process.env.SUMUP_DEVELOPMENT_API_KEY;
			const sumupResponse = await fetch(
				`https://api.sumup.com/v0.1/checkouts/${checkoutId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (!sumupResponse.ok) {
				console.error("Failed to verify webhook event with SumUp API");
				// Return a 2xx to avoid unnecessary retries
				return NextResponse.json({}, { status: 200 });
			}

			const checkoutDetails = await sumupResponse.json();
			console.log("Verified checkout details:", checkoutDetails);

			// Check the checkout status (adjust status name per SumUp's API response)
			if (
				checkoutDetails.status === "COMPLETED" ||
				checkoutDetails.status === "succeeded"
			) {
				const purchasedItems = checkoutDetails.purchasedItems;
				if (Array.isArray(purchasedItems)) {
					// Initialize Contentful Management client
					const managementClient = createClient({
						accessToken: process.env
							.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN as string,
					});
					const space = await managementClient.getSpace(
						process.env.CONTENTFUL_SPACE_ID as string
					);
					const environment = await space.getEnvironment(
						process.env.CONTENTFUL_ENVIRONMENT || "master"
					);

					// Process each purchased item concurrently
					const updateResults = await Promise.all(
						purchasedItems.map(async (recordId: string) => {
							try {
								let entry = await environment.getEntry(recordId);
								const currentQuantity =
									entry.fields.quantity?.["en-GB"] ?? 0;
								const newQuantity = currentQuantity - 1;

								if (newQuantity < 0) {
									console.error(
										"Insufficient stock for record:",
										recordId
									);
									return { recordId, error: "Insufficient stock" };
								}

								// Update the quantity field for locale "en-GB"
								entry.fields.quantity = { "en-GB": newQuantity };
								// Optionally update the inStock boolean
								entry.fields.inStock = { "en-GB": newQuantity > 0 };

								// Update and publish the entry
								entry = await entry.update();
								await entry.publish();

								console.log(
									`Updated record ${recordId}: New quantity is ${newQuantity}`
								);
								return { recordId, newQuantity };
							} catch (err: unknown) {
								if (err instanceof Error) {
									console.error(
										"Error updating record:",
										recordId,
										err
									);
									return { recordId, error: err.message };
								}
								console.error(
									"Unexpected error updating record:",
									recordId,
									err
								);
								return { recordId, error: "Unknown error" };
							}
						})
					);

					console.log("Update results:", updateResults);
				}
			}
		}

		// Return empty 200 response required by SumUp
		return NextResponse.json({}, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error processing webhook:", error);
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
