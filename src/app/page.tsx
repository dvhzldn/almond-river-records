import Image from "next/image";
import styles from "./page.module.css";
// For external links, we use standard <a> tags
// If you prefer using brands icons:
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
	return (
		<div className={styles.page}>
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
				<div className={styles.map}>
					<iframe
						width="90%"
						height="250"
						style={{ border: 0 }}
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.2716520508266!2d-3.292032172948193!3d55.943045299878484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c707d04ceedd%3A0xbbb0601c0f2583d!2sAlmond%20River%20Records!5e0!3m2!1sen!2suk!4v1741922054158!5m2!1sen!2suk"
						allowFullScreen
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
				<p>253 St. John’s Road</p>
				<p>Corstorphine</p>
				<p>Edinburgh</p>
				<p>EH12 7XD</p>
				<div className={styles.socialWrapper}>
					<div className={styles.socialLinks}>
						<a
							href="https://www.facebook.com/almondriverrecords/?locale=en_GB"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon icon={faFacebook} />
						</a>
						<a
							href="https://www.instagram.com/almondriverrecords/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon icon={faInstagram} />
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
