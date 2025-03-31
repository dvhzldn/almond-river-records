import { NextRequest, NextResponse } from "next/server";
import { createClient } from "contentful-management";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(req: NextRequest) {
	const token = req.headers.get("authorization")?.replace("Bearer ", "");

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const {
		data: { user },
		error,
	} = await supabaseAdmin.auth.getUser(token);

	if (error || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

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
