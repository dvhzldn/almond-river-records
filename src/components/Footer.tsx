import Link from "next/link";

export default function Footer() {
	return (
		<footer className="footer">
			<ul>
				<li>
					<Link href="mailto:almondriverrecords@gmail.com">Email Us</Link>
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
		</footer>
	);
}
