import { NextResponse } from "next/server";
import { createClient } from "contentful";

const client = createClient({
	space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
	accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

export async function GET() {
	try {
		const entries = await client.getEntries({
			content_type: "vinylRecord",
			order: "-sys.updatedAt",
			limit: 1000,
		});

		const records = entries.items.map((entry) => {
			const fields = entry.fields;
			const coverImageFile = fields.coverImage?.fields?.file;

			return {
				id: entry.sys.id,
				title: fields.title,
				artistName: fields.artistName,
				coverImageUrl: coverImageFile?.url
					? `https:${coverImageFile.url}`
					: undefined,
			};
		});

		return NextResponse.json(records);
	} catch (err) {
		console.error("[Contentful Fetch Error]", err);
		return NextResponse.json(
			{ error: "Failed to load records" },
			{ status: 500 }
		);
	}
}
