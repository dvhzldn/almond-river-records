"use client";

import dynamic from "next/dynamic";

const AlbumOfTheWeek = dynamic(() => import("@/components/AlbumOfTheWeek"), {
	ssr: false,
});
// const SpotifyPlaylist = dynamic(() => import("@/components/SpotifyPlaylist"), {
// 	ssr: false,
// });
const GoogleReviews = dynamic(() => import("@/components/GoogleReviews"), {
	ssr: false,
});

export function HomeDynamicWidgets() {
	return (
		<>
			<section aria-labelledby="album-of-the-week-heading">
				<h2 id="album-of-the-week-heading">Album Of The Week</h2>
				<AlbumOfTheWeek />
			</section>

			<hr />

			{/* <section aria-labelledby="spotify-heading">
				<h2 id="spotify-heading">What We Are Listening To</h2>
				<SpotifyPlaylist playlistId="2XPOAAUp0mNqNmz7gk2Kfx" />
			</section>

			<hr /> */}

			<section aria-labelledby="reviews-heading">
				<h2 id="reviews-heading">Customer Reviews</h2>
				<GoogleReviews />
			</section>
		</>
	);
}
