import Link from "next/link";
import styles from "./Menu.module.css";

export default function Menu() {
	return (
		<nav className={styles.menu}>
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
