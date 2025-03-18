import { NextResponse } from "next/server";

type GoogleReview = {
	rating: number;
	text?: { text: string };
};

type Review = {
	rating: number;
	text: string;
};

const CACHE_DURATION = 60 * 60 * 1000; // Cache for 1 hour
let cachedReviews: Review[] | null = null;
let lastFetched = 0;

export async function GET() {
	const now = Date.now();

	// Serve cached data if available and still valid
	if (cachedReviews && now - lastFetched < CACHE_DURATION) {
		return NextResponse.json(cachedReviews);
	}

	const placeId = process.env.GOOGLE_PLACE_ID;
	const apiKey = process.env.GOOGLE_PLACES_API_KEY;

	if (!placeId || !apiKey) {
		return NextResponse.json(
			{ error: "Missing API credentials" },
			{ status: 500 }
		);
	}

	const url = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews`;

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": apiKey,
				"X-Goog-FieldMask": "reviews",
			},
		});

		const data = await response.json();

		if (data.reviews) {
			cachedReviews = data.reviews.map((review: GoogleReview) => ({
				rating: review.rating,
				text: review.text?.text || "",
			}));

			lastFetched = now;

			return NextResponse.json(cachedReviews);
		} else {
			return NextResponse.json(
				{ error: "No reviews found" },
				{ status: 404 }
			);
		}
	} catch (error) {
		console.error("Error fetching reviews:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reviews" },
			{ status: 500 }
		);
	}
}
