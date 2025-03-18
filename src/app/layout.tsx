import type { Metadata } from "next";
import "./globals.css";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Almond River Records",
	description: "Second hand vinyl record shop in Edinburgh",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<header>
					<Menu />
				</header>
				<main className="container">
					{children}
					<div className="contact">
						<p>Enquiries:</p>
						<p>
							<a href="mailto:almondriverrecords@gmail.com">
								almondriverrecords@gmail.com
							</a>
						</p>
						<p>07729 421682</p>
					</div>
					<p className="copyright">
						© {new Date().getFullYear()} Almond River Records
					</p>
					<p className="copyright">Made by Dave</p>
				</main>
				<ul>
					<li>
						<Link href="mailto:almondriverrecords@gmail.com">
							Email Us
						</Link>
					</li>
					<li>
						<Link href="tel:+447729421682">Call Us</Link>
					</li>
					<li>
						<Link href="/privacy-policy">Returns Policy</Link>
					</li>
					<li>
						<Link
							href="https://instagram.com/yourshop"
							target="_blank"
							rel="noopener noreferrer"
						>
							Instagram
						</Link>
					</li>
				</ul>

				<footer>
					<Footer />
				</footer>
			</body>
		</html>
	);
}
