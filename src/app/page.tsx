import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { HomeDynamicWidgets } from "@/components/HomeDynamicWidgets";

const NewThisWeek = dynamic(() => import("@/components/NewThisWeek"), {
	loading: () => <p>Loading new records...</p>,
});

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
							width={382}
							height={382}
							priority
							sizes="(max-width: 768px) 100vw, 250px"
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

				{/* Dynamic client-only content */}
				<HomeDynamicWidgets />
			</div>
		</main>
	);
}
