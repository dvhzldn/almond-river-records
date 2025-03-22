import { NextResponse } from "next/server";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";

// Extend Contentful Entry Type to Include `contentTypeId`
type VinylRecordEntry = {
	sys: {
		id: string;
		contentTypeId: string;
		createdAt: string;
	};
	fields: unknown;
};

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	// Check if we should filter for records created in the last 7 days.
	const newThisWeek = searchParams.get("newThisWeek");

	// Extract filters from query params.
	const searchQuery = searchParams.get("search") || "";
	const condition = searchParams.get("condition") || "";
	const artist = searchParams.get("artist") || "";
	const artists = searchParams.getAll("artist");
	const genre = searchParams.get("genre") || "";
	const genres = searchParams.getAll("genre");

	// Extract pagination parameters (default: limit 12, skip 0)
	const limitParam = searchParams.get("limit")
		? Number(searchParams.get("limit"))
		: 12;
	const skipParam = searchParams.get("skip")
		? Number(searchParams.get("skip"))
		: 0;

	// Build query parameters for Contentful using a custom type.
	type RecordsQueryParams = {
		content_type: string;
		limit: number;
		skip: number;
		query?: string;
		"fields.genre[all]"?: string | string[];
		"fields.price[gte]"?: number;
		"fields.price[lte]"?: number;
		"fields.vinylCondition"?: string;
		"fields.artistName[in]"?: string | string[];
		order?: string;
		"fields.quantity[eq]": number;
		"fields.inStock": boolean;
		"sys.createdAt[gte]"?: string;
	};

	const params: RecordsQueryParams = {
		content_type: "vinylRecord",
		limit: limitParam,
		skip: skipParam,
		"fields.quantity[eq]": 1,
		"fields.inStock": true, // shorthand equality for booleans
	};

	// If newThisWeek is specified, filter by creation date.
	if (newThisWeek) {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		params["sys.createdAt[gte]"] = sevenDaysAgo.toISOString();
	}

	// Apply search filter via Contentful's full-text search.
	if (searchQuery) {
		params.query = searchQuery;
	}

	// Apply condition filter.
	if (condition) {
		params["fields.vinylCondition"] = condition;
	}

	// Apply artist filter.
	if (artist) {
		params["fields.artistName[in]"] = [artist];
	}
	if (artists.length > 0) {
		params["fields.artistName[in]"] = artists;
	}

	// Apply genre filter.
	if (genre) {
		params["fields.genre[all]"] = genre;
	}
	if (genres.length > 0) {
		params["fields.genre[all]"] = genres;
	}

	// Sort records by creation date (most recent first)
	params.order = "-sys.createdAt";

	try {
		// Fetch records from Contentful with filters and pagination.
		const res = (await client.getEntries(params)) as unknown as {
			total: number;
			items: VinylRecordEntry[];
		};

		// Map data properly, casting fields via unknown to satisfy our type.
		const records = res.items.map((record) => {
			const fields = record.fields as unknown as IVinylRecordFields;
			return {
				id: record.sys.id,
				title: fields.title ?? "Unknown Title",
				artistName: fields.artistName ?? [],
				label: fields.label ?? "Unknown Label",
				price: fields.price ?? 0,
				genre: fields.genre ?? [],
				vinylCondition: fields.vinylCondition ?? "Unknown Condition",
				sleeveCondition: fields.sleeveCondition ?? "Unknown Condition",
				inStock: fields.inStock ?? false,
				releaseYear: fields.releaseYear ?? null,
				coverImage: fields.coverImage?.fields.file?.url
					? `https:${fields.coverImage.fields.file.url}?w=250&h=250&fit=thumb&fm=webp&q=80`
					: null,
				otherImages: fields.otherImages
					? fields.otherImages
							.map((asset) =>
								asset.fields.file?.url
									? `https:${asset.fields.file.url}?w=250&h=250&fit=thumb&fm=webp&q=80`
									: null
							)
							.filter((url) => url !== null)
					: [],
				description: fields.description,
			};
		});

		return NextResponse.json({ records, total: res.total });
	} catch (error) {
		console.error("Error fetching records:", error);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
