import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL!,
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
		console.error(`❌ Failed to fetch asset ${assetId}`);
		return null;
	}
	return await res.json();
}

async function backfillAssets() {
	const { data: assets, error } = await supabase
		.from("contentful_assets")
		.select("id, url, file_name, content_type");

	if (error) throw error;

	console.log(`🔍 Found ${assets.length} contentful_assets to validate.`);

	for (const asset of assets) {
		const needsUpdate = !asset.url || !asset.file_name || !asset.content_type;

		if (!needsUpdate) continue;

		const fresh = await fetchContentfulAsset(asset.id);
		if (!fresh) {
			console.warn(`⚠️ Could not fetch asset ${asset.id}`);
			continue;
		}

		const file = fresh.fields?.file?.["en-GB"];
		const rawPath = file?.url;

		const updateData = {
			id: asset.id,
			title: fresh.fields?.title?.["en-GB"] ?? null,
			url: constructImageUrl(rawPath, false),
			details: file?.details ?? null,
			file_name: file?.fileName ?? null,
			content_type: file?.contentType ?? null,
			created_at: fresh.sys?.createdAt ?? new Date().toISOString(),
			updated_at: fresh.sys?.updatedAt ?? new Date().toISOString(),
			revision: fresh.sys?.revision ?? null,
			published_version: fresh.sys?.publishedVersion ?? null,
		};

		const { error: updateError } = await supabase
			.from("contentful_assets")
			.upsert(updateData, { onConflict: "id" });

		if (updateError) {
			console.error(`❌ Failed to update ${asset.id}`, updateError);
		} else {
			console.log(`✅ Updated asset ${asset.id}`);
		}
	}
}

backfillAssets()
	.then(() => console.log("✅ Asset backfill complete."))
	.catch((err) => console.error("❌ Error:", err));
