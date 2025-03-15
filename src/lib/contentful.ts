// lib/contentful.ts
import { createClient, Entry } from "contentful";
import { VinylRecordSkeleton } from "./types";

const client = createClient({
	space: process.env.CONTENTFUL_SPACE_ID!,
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export async function fetchVinylRecords(): Promise<
	Entry<VinylRecordSkeleton>[]
> {
	const entries = await client.getEntries<VinylRecordSkeleton>({
		content_type: "vinylRecord",
		locale: "en-GB", // correct locale here
	});

	return entries.items;
}
