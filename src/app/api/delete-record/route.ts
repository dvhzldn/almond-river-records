import { NextRequest, NextResponse } from "next/server";
import { createClient } from "contentful-management";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(req: NextRequest) {
	// Start of the process - log incoming request
	console.log("Received DELETE request to archive and delete record.");

	// Check for the authorization token
	const token = req.headers.get("authorization")?.replace("Bearer ", "");
	if (!token) {
		console.log("❌ Missing authorization token.");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get user from Supabase
	const {
		data: { user },
		error,
	} = await supabaseAdmin.auth.getUser(token);
	if (error || !user) {
		console.log(
			"❌ Unauthorized request. No user found or authentication failed."
		);
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	console.log(
		`✅ User authorized. Proceeding with record deletion for user ${user.id}.`
	);

	// Retrieve the recordId from the request parameters
	const recordId = req.nextUrl.searchParams.get("id");
	if (!recordId) {
		console.log("❌ Missing record ID in the request.");
		return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
	}
	console.log(`✅ Record ID received: ${recordId}.`);

	const client = createClient({
		accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN!,
	});

	try {
		// Step 1: Fetch the record from Contentful
		console.log(`⏳ Attempting to fetch record ${recordId} from Contentful.`);
		const space = await client.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!
		);
		const environment = await space.getEnvironment("master");
		const entry = await environment.getEntry(recordId);

		// Step 2: Unpublish and Archive the record in Contentful
		if (entry.isPublished()) {
			console.log(
				`⏳ Record is published. Unpublishing record ${recordId} from Contentful.`
			);
			await entry.unpublish(); // Unpublish if the record is published
		}

		console.log(`⏳ Archiving record ${recordId} in Contentful.`);
		await entry.archive(); // Archive the record in Contentful

		// Step 3: Delete the record from Supabase
		console.log(`⏳ Attempting to delete record ${recordId} from Supabase.`);
		const { error: deleteError } = await supabaseAdmin
			.from("vinyl_records")
			.delete()
			.eq("id", recordId);

		if (deleteError) {
			console.error(
				`❌ Error deleting record ${recordId} from Supabase: ${deleteError.message}`
			);
			await logEvent("vinyl-record-archive-error", {
				source: "contentful-webhook",
				status: "error",
				recordId,
				error: deleteError.message,
			});
			return NextResponse.json(
				{ error: "Failed to delete record from Supabase" },
				{ status: 500 }
			);
		}
		console.log(`✅ Record ${recordId} successfully deleted from Supabase.`);

		// Log success after both operations (delete from Supabase and archive in Contentful)
		await logEvent("vinyl-record-archive-success", {
			source: "contentful-webhook",
			status: "success",
			recordId,
			message: "Record successfully archived and deleted from Supabase",
		});

		return NextResponse.json({ success: true });
	} catch (err) {
		// Catch any errors in the process
		console.error(
			`❌ Error processing the request for record ${recordId}:`,
			err
		);
		await logEvent("vinyl-record-archive-error", {
			source: "contentful-webhook",
			status: "error",
			recordId,
			error: err instanceof Error ? err.message : "Unexpected error",
		});
		return NextResponse.json(
			{
				error:
					err instanceof Error
						? err.message
						: "Failed to archive record or delete from Supabase",
			},
			{ status: 500 }
		);
	}
}
