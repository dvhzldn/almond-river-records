import Image from "next/image";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import NewThisWeek from "@/components/NewThisWeek";

export default function Home() {
	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<Image
					className={styles.logo}
					src="/almond-river-logo.jpg"
					alt="Almond River Records logo"
					width={300}
					height={300}
					priority
				/>
				<h1>Almond River Records</h1>
				<h2>New website coming soon.</h2>

				<div>
					<h1>Almond River Records</h1>
					<NewThisWeek />
				</div>

				<div className={styles.socialWrapper}>
					<div className={styles.socialLinks}>
						<a
							href="https://www.facebook.com/almondriverrecords/?locale=en_GB"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon icon={faFacebook} />
							Facebook
						</a>
						<a
							href="https://www.instagram.com/almondriverrecords/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon icon={faInstagram} />
							Instagram
						</a>
					</div>
				</div>

				<div className={styles.contact}>
					<p>Enquiries:</p>
					<p>
						<a href="mailto:almondriverrecords@gmail.com">
							almondriverrecords@gmail.com
						</a>
					</p>
					<p>07729 421682</p>
				</div>
			</main>
		</div>
	);
}
