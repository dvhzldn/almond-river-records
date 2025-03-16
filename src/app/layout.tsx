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
				<main className="container">{children}</main>
				<p className="copyright">
					© {new Date().getFullYear()} Almond River Records
				</p>
				<p className="copyright">Made by Dave</p>

				<footer>
					<Footer />
				</footer>
			</body>
		</html>
	);
}
