import Image from "next/image";
import Link from "next/link";
import NewThisWeek from "@/components/NewThisWeek";
import AlbumOfTheWeek from "@/components/AlbumOfTheWeek";
import GoogleReviews from "@/components/GoogleReviews";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";

export default async function Home() {
	const base = process.env.NEXT_PUBLIC_BASE_URL;
	if (!base) {
		throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
	}

	const endpoint = new URL("/api/records?newThisWeek=true", base).toString();

	const res = await fetch(endpoint, {
		next: { revalidate: 60 },
	});

	if (!res.ok) {
		const text = await res.text();
		console.error("Failed to fetch API:", text);
		throw new Error(`Failed to fetch: ${res.status}`);
	}

	const data = await res.json();

	return (
		<main className="page-container" role="main">
			<h1 className="page-title">Almond River Records</h1>

			<div className="content-box">
				<section aria-labelledby="logo-browse-section">
					<h2 id="logo-browse-section" className="sr-only">
						Logo and browse link
					</h2>

					<div>
						<Image
							className="logo-home"
							src="/images/almond-river-logo.jpg"
							alt="Almond River Records logo"
							width={300}
							height={300}
							priority
						/>
					</div>

					<div className="view-all-records">
						<h2>
							<Link className="browse-hero" href="/records">
								Browse Our Records
							</Link>
						</h2>
					</div>
				</section>

				<hr />

				<section aria-labelledby="new-this-week-heading">
					<h2 id="new-this-week-heading">New Arrivals This Week</h2>
					<NewThisWeek records={data.records} />
				</section>

				<hr />

				<section aria-labelledby="album-of-the-week-heading">
					<h2 id="album-of-the-week-heading">Album Of The Week</h2>
					<AlbumOfTheWeek />
				</section>

				<hr />

				<section aria-labelledby="spotify-heading">
					<h2 id="spotify-heading">What We Are Listening To</h2>
					<SpotifyPlaylist playlistId="2XPOAAUp0mNqNmz7gk2Kfx" />
				</section>

				<hr />

				<section aria-labelledby="reviews-heading">
					<h2 id="reviews-heading">Customer Reviews</h2>
					<GoogleReviews />
				</section>
			</div>
		</main>
	);
}
