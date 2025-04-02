import type { Metadata } from "next";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import { Lato, Oswald } from "next/font/google";
import "./globals.css";
import SiteMenu from "@/components/Menu";
import Footer from "@/components/Footer";
import { BasketProvider } from "./api/context/BasketContext";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

const lato = Lato({
	subsets: ["latin"],
	weight: ["300", "400", "700"],
	variable: "--font-lato",
	display: "swap",
});
const oswald = Oswald({
	subsets: ["latin"],
	weight: ["300", "400", "700"],
	variable: "--font-oswald",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Almond River Records",
	description: "Second hand vinyl record shop in Edinburgh",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${lato.variable} ${oswald.variable}`}>
			<head>
				<meta charSet="UTF-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>

				<UmamiAnalytics />
			</head>
			<BasketProvider>
				<body>
					<header>
						<SiteMenu />
					</header>
					<Suspense fallback={<div>Loading...</div>}>
						<main>{children}</main>
					</Suspense>
					<footer>
						<Footer />
					</footer>
				</body>
			</BasketProvider>
			<Analytics />
		</html>
	);
}
