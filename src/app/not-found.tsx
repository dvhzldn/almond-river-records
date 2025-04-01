import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "404 – Page Not Found | Almond River Records",
	description:
		"This page does not exist. Visit the homepage or contact us if you need help.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function NotFoundPage() {
	return (
		<main role="main" aria-labelledby="not-found-title">
			<div className="page-container">
				<h1 id="not-found-title" className="page-title" tabIndex={-1}>
					Page not found
				</h1>
				<div className="content-box">
					<h2>
						We are sorry, but the page you were looking for does not
						exist.
					</h2>
					<p>
						If you are having any difficulty with the site, you can send
						us a message from our{" "}
						<Link href="/contact" className="hyperLink">
							contact page
						</Link>
						.
					</p>
					<br />
					<p>
						Or you can return to the{" "}
						<Link href="/" className="hyperLink">
							homepage
						</Link>
						.
					</p>
				</div>
			</div>
		</main>
	);
}
