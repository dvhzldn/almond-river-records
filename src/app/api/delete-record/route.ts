import { NextRequest, NextResponse } from "next/server";
import { createClient } from "contentful-management";

export async function DELETE(req: NextRequest) {
	const recordId = req.nextUrl.searchParams.get("id");

	if (!recordId) {
		return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
	}

	const client = createClient({
		accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN!,
	});

	try {
		const space = await client.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!
		);
		const environment = await space.getEnvironment("master");
		const entry = await environment.getEntry(recordId);

		// Unpublish before archiving
		if (entry.isPublished()) {
			await entry.unpublish();
		}

		await entry.archive();

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Error archiving record:", err);
		return NextResponse.json(
			{ error: "Failed to archive record." },
			{ status: 500 }
		);
	}
}
