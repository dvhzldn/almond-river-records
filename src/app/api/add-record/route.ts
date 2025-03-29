import { NextRequest, NextResponse } from "next/server";
import { createClient, Asset, Environment } from "contentful-management";

const waitForAssetProcessing = async (
	env: Environment,
	assetId: string,
	timeout = 10000,
	interval = 500
): Promise<Asset> => {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const updatedAsset = await env.getAsset(assetId);
		const file = updatedAsset.fields?.file?.["en-GB"];

		if (file?.url && file?.details?.image?.width) {
			return updatedAsset;
		}

		await new Promise((res) => setTimeout(res, interval));
	}

	throw new Error("Asset processing timeout");
};

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();

		const getValues = (key: string) =>
			formData
				.getAll(key)
				.map((v) => v.toString().trim())
				.filter((v) => v.length > 0);

		const title = formData.get("title")?.toString() ?? "";
		const artistName = getValues("artistName[]");
		const displayArtist = artistName.join(", ");
		const displayTitle = `${displayArtist} - ${title} (cover)`;
		const normalizedFileName = `${displayTitle}.jpg`.replace(
			/[/\\?%*:|"<>]/g,
			""
		);
		const releaseYear = Number(formData.get("releaseYear"));
		const genre = getValues("genre[]");
		const label = formData.get("label")?.toString() ?? "";
		const price = Number(formData.get("price"));
		const catalogueNumber = formData.get("catalogueNumber")?.toString() ?? "";
		const vinylCondition = formData.get("vinylCondition")?.toString() ?? "";
		const sleeveCondition = formData.get("sleeveCondition")?.toString() ?? "";
		const description = formData.get("description")?.toString() ?? "";
		const coverImage = formData.get("coverImage") as File | null;

		if (!coverImage) {
			return NextResponse.json({ error: "Missing image" }, { status: 400 });
		}

		const contentful = createClient({
			accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN ?? "",
		});

		const space = await contentful.getSpace(
			process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? ""
		);
		const env = await space.getEnvironment(
			process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID ?? "master"
		);

		const arrayBuffer = await coverImage.arrayBuffer();

		const asset = await env.createAssetFromFiles({
			fields: {
				title: { "en-GB": displayTitle },
				description: { "en-GB": "" },
				file: {
					"en-GB": {
						contentType: coverImage.type || "image/jpeg",
						fileName: normalizedFileName,
						file: arrayBuffer,
					},
				},
			},
		});
		await asset.processForAllLocales();
		const processedAsset = await waitForAssetProcessing(env, asset.sys.id);
		await processedAsset.publish();

		const fields: {
			[key: string]: {
				"en-GB": unknown;
			};
		} = {
			title: { "en-GB": title },
			artistName: { "en-GB": artistName },
			releaseYear: { "en-GB": releaseYear },
			genre: { "en-GB": genre },
			label: { "en-GB": label },
			price: { "en-GB": price },
			catalogueNumber: { "en-GB": catalogueNumber },
			vinylCondition: { "en-GB": vinylCondition },
			sleeveCondition: { "en-GB": sleeveCondition },
			coverImage: {
				"en-GB": {
					sys: {
						type: "Link",
						linkType: "Asset",
						id: processedAsset.sys.id,
					},
				},
			},
			quantity: { "en-GB": 1 },
			inStock: { "en-GB": true },
			sold: { "en-GB": false },
		};

		// ✅ Add description only if not empty
		if (description.trim()) {
			fields.description = {
				"en-GB": {
					nodeType: "document",
					data: {},
					content: [
						{
							nodeType: "paragraph",
							data: {},
							content: [
								{
									nodeType: "text",
									value: description.trim(),
									marks: [],
									data: {},
								},
							],
						},
					],
				},
			};
		}

		const entry = await env.createEntry("vinylRecord", { fields });
		await entry.publish();

		return NextResponse.json({ message: "Success" });
	} catch (err: unknown) {
		console.error("[Contentful Error]", err);
		return NextResponse.json(
			{ error: (err as Error).message || "Unknown error" },
			{ status: 500 }
		);
	}
}
