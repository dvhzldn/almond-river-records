import { headers } from "next/headers";
import Image from "next/image";
import NewThisWeek from "@/components/NewThisWeek";
import AlbumOfTheWeek from "@/components/AlbumOfTheWeek";
import GoogleReviews from "@/components/GoogleReviews";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";

export default async function Home() {
	// Await the headers() function to get the Headers object
	const headersList = await headers();
	const host = headersList.get("host");
	const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

	const res = await fetch(
		`${protocol}://${host}/api/records?newThisWeek=true`,
		{
			next: { revalidate: 60 },
		}
	);
	const data = await res.json();

	return (
		<div className="page-container">
			<h1 className="page-title">Almond River Records</h1>
			<div className="content-box">
				<Image
					className="logo"
					src="/images/almond-river-logo.jpg"
					alt="Almond River Records logo"
					width={300}
					height={300}
					priority
				/>
				<hr />
				<div>
					<NewThisWeek records={data.records} />
				</div>
				<hr />
				<div>
					<AlbumOfTheWeek />
				</div>
				<hr />
				<div>
					<h2>What we are listening to</h2>
					<SpotifyPlaylist playlistId="2XPOAAUp0mNqNmz7gk2Kfx" />
				</div>
				<hr />
				<div>
					<GoogleReviews />
				</div>
			</div>
		</div>
	);
}
