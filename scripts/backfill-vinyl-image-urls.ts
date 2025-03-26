import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load env vars from project root
const envPath = path.resolve(__dirname, "../.env");
console.log("🔍 Attempting to load .env from:", envPath);
console.log("📄 Exists?", fs.existsSync(envPath));

dotenv.config({ path: envPath });

console.log("🔍 Raw environment keys loaded:");
console.log(Object.keys(process.env).filter((k) => k.includes("SUPABASE")));

console.log("🧪 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
	"🧪 SERVICE_ROLE_KEY present?",
	!!process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Safely construct full Contentful image URLs
function constructImageUrl(filePath: string, optimized = false): string {
	if (!filePath) return "";

	// If it already looks like a full URL, just use it
	if (filePath.startsWith("http")) {
		return optimized
			? `${filePath}?w=400&h=400&fm=webp&q=70&fit=thumb`
			: filePath;
	}

	// If it's a path like "/hvl6gmwk3ce2/...", prepend domain
	const cleanPath = filePath.startsWith("/")
		? `https://images.ctfassets.net${filePath}`
		: `https://${filePath}`; // fallback

	return optimized
		? `${cleanPath}?w=400&h=400&fm=webp&q=70&fit=thumb`
		: cleanPath;
}

// ✅ Fetch asset directly from Contentful API
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

// ✅ Main backfill function
async function backfillCoverImageUrls() {
	const { data: records, error } = await supabase
		.from("vinyl_records")
		.select("id, cover_image, cover_image_url")
		.not("cover_image", "is", null);

	if (error) throw error;

	console.log(`🔍 Found ${records.length} vinyl_records with cover_image.`);

	for (const record of records) {
		const assetId = record.cover_image;
		if (!assetId) continue;

		let correctFileUrl: string | null = null;

		// 1️⃣ Try local contentful_assets table
		const { data: asset } = await supabase
			.from("contentful_assets")
			.select("url")
			.eq("id", assetId)
			.single();

		if (asset?.url) {
			correctFileUrl = constructImageUrl(asset.url, true);
		}

		// 2️⃣ Fallback to Contentful API
		if (!correctFileUrl) {
			const liveAsset = await fetchContentfulAsset(assetId);
			const file = liveAsset?.fields?.file?.["en-GB"];
			const raw = file?.url;

			if (raw) {
				correctFileUrl = constructImageUrl(raw, true);
			}
		}

		if (!correctFileUrl) {
			console.warn(`⚠️ Could not resolve URL for asset ${assetId}`);
			continue;
		}

		// 3️⃣ If it's already correct, skip
		if (record.cover_image_url === correctFileUrl) {
			console.log(`⏭️  Skipping ${record.id} — already up to date`);
			continue;
		}

		// 4️⃣ Update Supabase record
		const { error: updateError } = await supabase
			.from("vinyl_records")
			.update({ cover_image_url: correctFileUrl })
			.eq("id", record.id);

		if (updateError) {
			console.error(`❌ Failed to update ${record.id}`, updateError);
		} else {
			console.log(`✅ Updated ${record.id}`);
		}
	}
}

backfillCoverImageUrls()
	.then(() => console.log("✅ Backfill complete."))
	.catch((err) => console.error("❌ Error:", err));
