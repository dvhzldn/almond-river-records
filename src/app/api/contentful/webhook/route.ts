import { logEvent } from "@/lib/logger"; // Axiom logger
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchAndUpdateTracklist } from "@/lib/fetchAndUpdateTracklist";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function constructImageUrl(filePath: string, optimized = false): string {
	if (!filePath) return "";
	const base = `https:${filePath}`;
	return optimized ? `${base}?w=400&h=400&fm=webp&q=70&fit=thumb` : base;
}

async function fetchContentfulAsset(assetId: string) {
	const url = `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}/assets/${assetId}`;
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN}`,
			"Content-Type": "application/json",
		},
	});
	if (!res.ok) {
		console.error(`❌ Failed to fetch asset ${assetId} from Contentful`);
		return null;
	}
	return await res.json();
}

export async function POST(req: Request) {
	try {
		const payload = await req.json();
		const sys = payload.sys;

		// Handle Deleted Vinyl Record
		if (
			sys?.type === "DeletedEntry" &&
			sys?.contentType?.sys?.id === "vinylRecord"
		) {
			const recordId = sys.id;
			console.log(`Deleting vinyl record from Contentful: ${recordId}`);

			// Log that the record is being deleted
			await logEvent("vinyl-record-deleted", {
				source: "contentful-webhook",
				status: "success",
				recordId,
				message: "Record deleted via Contentful webhook",
			});

			// Try to delete the record from Supabase
			const { error } = await supabase
				.from("vinyl_records")
				.delete()
				.eq("id", recordId);

			if (error) {
				console.error(
					`❌ Error deleting vinyl record ${recordId}: ${error.message}`
				);
				await logEvent("vinyl-record-delete-error", {
					source: "contentful-webhook",
					status: "error",
					recordId,
					error: error.message,
				});
				return NextResponse.json(
					{ error: "Error deleting vinyl record from Supabase" },
					{ status: 500 }
				);
			}

			console.log(`✅ Vinyl record ${recordId} deleted from Supabase.`);
			await logEvent("vinyl-record-delete-success", {
				source: "contentful-webhook",
				status: "success",
				recordId,
				message: "Record successfully deleted from Supabase",
			});

			return NextResponse.json({ success: true }, { status: 200 });
		}

		// Handle Contentful Asset Updates
		if (sys?.type === "Asset") {
			const id = sys.id;
			const f = payload.fields;

			const file = f.file?.["en-GB"];
			const asset = {
				id,
				title: f.title?.["en-GB"] ?? null,
				url: constructImageUrl(file?.url, false),
				details: file?.details ?? null,
				file_name: file?.fileName ?? null,
				content_type: file?.contentType ?? null,
				created_at: sys.createdAt ?? new Date().toISOString(),
				updated_at: sys.updatedAt ?? new Date().toISOString(),
				revision: sys.revision ?? null,
				published_version: sys.publishedVersion ?? null,
			};

			console.log(`Inserting/Updating Asset ${id} in Supabase.`);
			await logEvent("contentful-asset-inserted", {
				source: "contentful-webhook",
				status: "success",
				assetId: id,
				message: "Asset inserted via Contentful webhook",
			});

			// Upsert the asset in Supabase
			const { error } = await supabase
				.from("contentful_assets")
				.upsert(asset, { onConflict: "id" });

			if (error) {
				console.error(`❌ Error inserting asset ${id}: ${error.message}`);
				await logEvent("contentful-asset-insert-error", {
					source: "contentful-webhook",
					status: "error",
					assetId: id,
					error: error.message,
				});
				return NextResponse.json(
					{ error: "Error inserting asset into Supabase" },
					{ status: 500 }
				);
			}

			console.log(`✅ Asset ${id} inserted/updated successfully.`);
			return NextResponse.json({ success: true }, { status: 200 });
		}

		// Handle Vinyl Record Updates
		if (sys?.contentType?.sys?.id === "vinylRecord") {
			const f = payload.fields;
			const id = sys.id;

			// Build the record object for update
			const record = {
				id,
				title: f.title?.["en-GB"] ?? "",
				sub_title: f.subTitle?.["en-GB"] ?? null,
				artist_names: f.artistName?.["en-GB"] ?? [],
				artist_names_text: (f.artistName?.["en-GB"] ?? []).join(" & "),
				price: f.price?.["en-GB"] ?? 0,
				vinyl_condition: f.vinylCondition?.["en-GB"] ?? "Unknown",
				sleeve_condition: f.sleeveCondition?.["en-GB"] ?? "Unknown",
				label: f.label?.["en-GB"] ?? "",
				release_year: f.releaseYear?.["en-GB"] ?? 0,
				genre: f.genre?.["en-GB"] ?? [],
				description: f.description?.["en-GB"] ?? null,
				link: f.link?.["en-GB"] ?? null,
				catalogue_number: f.catalogueNumber?.["en-GB"] ?? null,
				barcode: f.barcode?.["en-GB"] ?? null,
				quantity: f.quantity?.["en-GB"] ?? 1,
				in_stock: f.inStock?.["en-GB"] ?? true,
				sold: f.sold?.["en-GB"] ?? false,
				album_of_the_week: f.albumOfTheWeek?.["en-GB"] ?? false,
				cover_image: null as string | null,
				cover_image_url: null as string | null,
				other_images: [] as string[],
			};

			// Extract references
			const coverRef = f.coverImage?.["en-GB"];
			const otherRefs = f.otherImages?.["en-GB"] ?? [];

			// Fetch cover image and assign
			if (coverRef?.sys?.id) {
				const assetId = coverRef.sys.id;
				const asset = await fetchContentfulAsset(assetId);

				if (!asset) {
					console.error(
						`❌ Could not retrieve cover asset for record ${id}.`
					);
					return NextResponse.json(
						{ error: "Asset not found" },
						{ status: 500 }
					);
				}

				const file = asset.fields?.file?.["en-GB"];
				const filePath = file?.url;

				if (!filePath) {
					console.error("❌ Missing file path for cover image.");
					return NextResponse.json(
						{ error: "Asset file missing" },
						{ status: 500 }
					);
				}

				record.cover_image = assetId;
				record.cover_image_url = constructImageUrl(filePath, true);
			}

			// Check if cover image or URL is missing
			if (!record.cover_image || !record.cover_image_url) {
				console.error("❌ Missing cover image or cover image URL.");
				return NextResponse.json(
					{ error: "Missing cover_image or cover_image_url" },
					{ status: 400 }
				);
			}

			// Handle other image references if present
			for (const ref of otherRefs) {
				if (ref?.sys?.id && ref.sys.id !== record.cover_image) {
					record.other_images.push(ref.sys.id);
				}
			}

			// Insert or update the record in Supabase
			const { error } = await supabase
				.from("vinyl_records")
				.upsert(record, { onConflict: "id" });

			if (error) {
				console.error(
					`❌ Error inserting vinyl record ${id}: ${error.message}`
				);
				await logEvent("vinyl-record-insert-error", {
					source: "contentful-webhook",
					status: "error",
					id,
					error: error.message,
				});
				return NextResponse.json({ error: error.message }, { status: 500 });
			}

			// Discogs tracklist
			if (!error) {
				await fetchAndUpdateTracklist(supabase, {
					id,
					title: record.title,
					artist_names_text: record.artist_names_text,
				});
			}

			console.log(`✅ Vinyl record ${id} inserted/updated successfully.`);
			await logEvent("vinyl-record-inserted", {
				source: "contentful-webhook",
				status: "success",
				recordId: id,
				title: record.title,
				artist_names: record.artist_names,
				cover_image_url: record.cover_image_url,
			});
			return NextResponse.json({ success: true }, { status: 200 });
		}
	} catch (err) {
		console.error("❌ Webhook error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unexpected error" },
			{ status: 500 }
		);
	}
}
