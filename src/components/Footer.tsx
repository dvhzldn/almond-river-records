//import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
	return (
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
	);
}
