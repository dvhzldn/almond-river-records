import Link from "next/link";

export default function Menu() {
	return (
		<nav className="menu">
			<ul>
				<li>
					<Link href="/">Home</Link>
				</li>
				<li>
					<Link href="/records">Shop</Link>
				</li>
				<li>
					<Link href="/blog">Blog</Link>
				</li>
				<li>
					<Link href="/reviews">Reviews</Link>
				</li>
				<li>
					<Link href="/contact">Contact</Link>
				</li>
			</ul>
		</nav>
	);
}
