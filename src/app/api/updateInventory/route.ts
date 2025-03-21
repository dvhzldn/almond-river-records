// src/app/api/updateInventory/route.ts
import { NextResponse } from "next/server";
import { createClient } from "contentful-management";

// This API route expects a JSON payload in the following format:
// {
//   "recordIds": ["recordId1", "recordId2", ...],
//   "action": "reserve" // or "release"
// }
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { recordIds, action } = body;

		if (!Array.isArray(recordIds)) {
			return NextResponse.json(
				{ error: "Invalid payload: recordIds must be an array." },
				{ status: 400 }
			);
		}

		// Default to "reserve" if action is not provided or is invalid.
		const updateAction = action === "release" ? "release" : "reserve";

		// Initialize the Contentful Management client
		const managementClient = createClient({
			accessToken: process.env
				.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN as string,
		});
		const space = await managementClient.getSpace(
			process.env.CONTENTFUL_SPACE_ID as string
		);
		// Use NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT or fallback to "master"
		const environment = await space.getEnvironment(
			process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"
		);

		// Process each record update concurrently
		const updateResults = await Promise.all(
			recordIds.map(async (recordId: string) => {
				try {
					let entry = await environment.getEntry(recordId);

					if (updateAction === "reserve") {
						// Reserve the item: mark as out of stock and set quantity to 0
						entry.fields.quantity = { "en-GB": 0 };
						entry.fields.inStock = { "en-GB": false };
					} else if (updateAction === "release") {
						// Release the item: mark as in stock and reset quantity to 1
						entry.fields.quantity = { "en-GB": 1 };
						entry.fields.inStock = { "en-GB": true };
					}

					entry = await entry.update();
					await entry.publish();

					return { recordId, updated: true };
				} catch (err: unknown) {
					if (err instanceof Error) {
						console.error(`Error updating record ${recordId}:`, err);
						return { recordId, error: err.message };
					}
					return { recordId, error: "Unknown error" };
				}
			})
		);

		return NextResponse.json({ results: updateResults });
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
