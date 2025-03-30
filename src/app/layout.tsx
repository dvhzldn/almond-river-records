import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import { Lato, Oswald } from "next/font/google";
import "./globals.css";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import { BasketProvider } from "./api/context/BasketContext";

const lato = Lato({
	subsets: ["latin"],
	weight: ["300", "400", "700"],
	variable: "--font-lato",
});
const oswald = Oswald({
	subsets: ["latin"],
	weight: ["300", "400", "700"],
	variable: "--font-oswald",
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

				<Analytics />
			</head>
			<BasketProvider>
				<body>
					<header>
						<Menu />
					</header>
					<main>{children}</main>
					<footer>
						<Footer />
					</footer>
				</body>
			</BasketProvider>
		</html>
	);
}
