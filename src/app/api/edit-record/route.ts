import { NextRequest, NextResponse } from "next/server";
import { createClient } from "contentful-management";
import { Document } from "@contentful/rich-text-types";

export async function POST(req: NextRequest) {
	const formData = await req.formData();

	const recordId = formData.get("id")?.toString();
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

		const title = formData.get("title")?.toString() ?? "";
		const releaseYear = formData.get("releaseYear")?.toString() ?? "";
		const label = formData.get("label")?.toString() ?? "";
		const price = formData.get("price")?.toString() ?? "";
		const catalogueNumber = formData.get("catalogueNumber")?.toString() ?? "";
		const vinylCondition = formData.get("vinylCondition")?.toString() ?? "";
		const sleeveCondition = formData.get("sleeveCondition")?.toString() ?? "";

		const descriptionText = formData.get("description")?.toString() ?? "";
		const description: Document =
			descriptionText.trim() === ""
				? {
						nodeType: "document",
						data: {},
						content: [],
					}
				: {
						nodeType: "document",
						data: {},
						content: [
							{
								nodeType: "paragraph",
								content: [
									{
										nodeType: "text",
										value: descriptionText,
										marks: [],
										data: {},
									},
								],
								data: {},
							},
						],
					};

		entry.fields.description = { "en-GB": description };

		const artistName = formData.getAll("artistName[]").map(String);
		const genre = formData.getAll("genre[]").map(String);

		// Update entry fields
		entry.fields.title = { "en-GB": title };
		entry.fields.artistName = { "en-GB": artistName };
		entry.fields.releaseYear = { "en-GB": Number(releaseYear) };
		entry.fields.genre = { "en-GB": genre };
		entry.fields.label = { "en-GB": label };
		entry.fields.price = { "en-GB": Number(price) };
		entry.fields.catalogueNumber = { "en-GB": catalogueNumber };
		entry.fields.vinylCondition = { "en-GB": vinylCondition };
		entry.fields.sleeveCondition = { "en-GB": sleeveCondition };
		entry.fields.description = { "en-GB": description };

		// If a new image was uploaded, process and link the asset
		const imageFile = formData.get("coverImage") as File | null;
		if (imageFile) {
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			const asset = await environment.createAssetFromFiles({
				fields: {
					title: { "en-GB": imageFile.name },
					file: {
						"en-GB": {
							contentType: imageFile.type,
							fileName: imageFile.name,
							file: buffer,
						},
					},
				},
			});

			const processedAsset = await asset.processForAllLocales();
			await processedAsset.publish();

			entry.fields.coverImage = {
				"en-GB": {
					sys: {
						type: "Link",
						linkType: "Asset",
						id: processedAsset.sys.id,
					},
				},
			};
		}

		const updatedEntry = await entry.update();
		await updatedEntry.publish();

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Error updating record:", err);
		return NextResponse.json(
			{ error: "Failed to update record." },
			{ status: 500 }
		);
	}
}
