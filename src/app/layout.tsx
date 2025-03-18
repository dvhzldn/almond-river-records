import type { Metadata } from "next";
import "./globals.css";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";

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
				<main>{children}</main>
				<footer>
					<Footer />
				</footer>
			</body>
		</html>
	);
}
