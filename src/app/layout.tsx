import type { Metadata } from "next";
import "./globals.css";

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
				<header></header>
				<main>{children}</main>
				<footer></footer>
			</body>
		</html>
	);
}
