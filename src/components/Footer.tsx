import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faHome } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
	return (
		<footer className="footer" role="contentinfo" aria-label="Site footer">
			<section aria-labelledby="contact-heading">
				<h2 id="contact-heading" className="sr-only">
					Contact Information
				</h2>
				<address
					className="footer-icon"
					itemScope
					itemType="https://schema.org/Organization"
				>
					<ul className="footer-contact">
						<li>
							<a
								href="mailto:almondriverrecords@gmail.com"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Email Almond River Records"
							>
								<FontAwesomeIcon
									icon={faEnvelope}
									className="footer-icon"
									aria-hidden="true"
								/>
								<span>Email: almondriverrecords@gmail.com</span>
							</a>
						</li>
						<li>
							<a
								href="tel:+447729421682"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Call Almond River Records at 07729 421682"
							>
								<FontAwesomeIcon
									icon={faPhone}
									className="footer-icon"
									aria-hidden="true"
								/>
								<span>Call: 07729 421682</span>
							</a>
						</li>
						<li>
							<a
								href="https://maps.app.goo.gl/7PSPh1NSHgHinheM9"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visit us at 253 St John's Road, Edinburgh"
							>
								<FontAwesomeIcon
									icon={faHome}
									className="footer-icon"
									aria-hidden="true"
								/>
								<span>{`253 St John's Rd, Edinburgh EH12 7XD`}</span>
							</a>
						</li>
					</ul>
				</address>
			</section>

			<section aria-labelledby="social-heading" className="socialWrapper">
				<h2 id="social-heading" className="sr-only">
					Follow us on social media
				</h2>
				<div className="socialLinks">
					<a
						href="https://www.facebook.com/almondriverrecords/?locale=en_GB"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Follow Almond River Records on Facebook"
					>
						<FontAwesomeIcon icon={faFacebook} aria-hidden="true" />
						<span>Facebook</span>
					</a>
					<a
						href="https://www.instagram.com/almondriverrecords/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Follow Almond River Records on Instagram"
					>
						<FontAwesomeIcon icon={faInstagram} aria-hidden="true" />
						<span>Instagram</span>
					</a>
				</div>
			</section>

			<section aria-label="Site policies and credits">
				<p>
					<Link href="/privacy">Privacy Policy</Link>
				</p>
				<p>© {new Date().getFullYear()} Almond River Records</p>
				<p>
					<small>Made by DH</small>
				</p>
			</section>
		</footer>
	);
}
