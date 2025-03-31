import { NextResponse } from "next/server";
import { createClient, Asset } from "contentful";
import { Document } from "@contentful/rich-text-types";

type VinylRecordFields = {
	title: string;
	artistName: string[];
	releaseYear: number;
	genre: string[];
	label: string;
	price: number;
	catalogueNumber: string;
	vinylCondition: string;
	sleeveCondition: string;
	description: Document;
	coverImage?: Asset;
};

const client = createClient({
	space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
	accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

export async function GET() {
	try {
		const entries = await client.getEntries({
			content_type: "vinylRecord",
			order: ["-sys.updatedAt"],
			limit: 1000,
		});

		const records = entries.items.map((entry) => {
			const fields = entry.fields as unknown as VinylRecordFields;

			const coverImageUrl = fields.coverImage?.fields?.file?.url
				? `https:${fields.coverImage.fields.file.url}`
				: undefined;

			return {
				id: entry.sys.id,
				title: fields.title,
				artistName: fields.artistName,
				coverImageUrl,
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
