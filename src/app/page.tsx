import Image from "next/image";
import NewThisWeek from "@/components/NewThisWeek";
import GoogleReviews from "@/components/GoogleReviews";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";

export default function Home() {
	return (
		<section className="section">
			<h1>Almond River Records</h1>
			<Image
				className="logo"
				src="/images/almond-river-logo.jpg"
				alt="Almond River Records logo"
				width={300}
				height={300}
				priority
			/>
			<div>
				<NewThisWeek />
			</div>
			<GoogleReviews />
			<div>
				<h2>What we are listening to</h2>
				<SpotifyPlaylist playlistId="2XPOAAUp0mNqNmz7gk2Kfx" />
			</div>
		</section>
	);
}
