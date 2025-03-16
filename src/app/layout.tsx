import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import styles from "./page.module.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Almond River Records",
	description: "Second hand vinyl record shop in Edinburgh",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<header>
					<nav>
						<ul>
							<li>
								<Link href="/">Home</Link>
							</li>
							<li>
								<Link href="/records">Records</Link>
							</li>
							<li>
								<Link href="/about">About</Link>
							</li>
							<li>
								<Link href="/contact">Contact</Link>
							</li>
						</ul>
					</nav>
				</header>
				<main>{children}</main>
				<footer className={styles.footer}>
					<p>© 2025 Almond River Records</p>
					<ul>
						<li>
							<a
								href="https://instagram.com/yourshop"
								target="_blank"
								rel="noopener noreferrer"
							>
								Instagram
							</a>
						</li>
						{/* Add other social media links here */}
					</ul>
				</footer>
			</body>
		</html>
	);
}
