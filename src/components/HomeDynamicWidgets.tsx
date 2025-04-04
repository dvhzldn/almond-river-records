"use client";

import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

const AlbumOfTheWeek = dynamic(() => import("@/components/AlbumOfTheWeek"), {
	ssr: false,
});
const GoogleReviews = dynamic(() => import("@/components/GoogleReviews"), {
	ssr: false,
});

// const SpotifyPlaylist = dynamic(() => import("@/components/SpotifyPlaylist"), {
// 	ssr: false,
// });

export function HomeDynamicWidgets() {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});
	const [hasLoaded, setHasLoaded] = useState(false);

	useEffect(() => {
		if (inView) setHasLoaded(true);
	}, [inView]);

	return (
		<div ref={ref}>
			{hasLoaded && (
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
			)}
		</div>
	);
}
