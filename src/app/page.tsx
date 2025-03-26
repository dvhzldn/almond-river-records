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
		<div className="page-container">
			<h1 className="page-title">Almond River Records</h1>
			<div className="content-box">
				<div>
					<Image
						className="logo-home"
						src="/images/almond-river-logo.jpg"
						alt="Almond River Records logo"
						width={300}
						height={300}
						priority
					/>{" "}
					<div className="view-all-records">
						<Link href="/records">
							<h2 className="view-all-records">View all records</h2>
						</Link>
					</div>
				</div>
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
