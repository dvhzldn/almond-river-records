import Link from "next/link";

export default function Footer() {
	return (
		<footer className="footer">
			<p>© 2025 Almond River Records</p>
			<ul>
				<li>
					<Link
						href="https://instagram.com/yourshop"
						target="_blank"
						rel="noopener noreferrer"
					>
						Instagram
					</Link>
				</li>
				{/* Add other social media links here */}
			</ul>
		</footer>
	);
}
