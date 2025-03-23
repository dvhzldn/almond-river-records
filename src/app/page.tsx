import Image from "next/image";
import NewThisWeek from "@/components/NewThisWeek";
import AlbumOfTheWeek from "@/components/AlbumOfTheWeek";
import GoogleReviews from "@/components/GoogleReviews";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";

export default async function Home() {
	const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

	const res = await fetch(`${baseURL}/api/records?newThisWeek=true`, {
		next: { revalidate: 60 },
	});

	if (!res.ok) {
		const text = await res.text();
		console.error("Failed to fetch API:", text);
		throw new Error(`Failed to fetch: ${res.status}`);
	}

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
