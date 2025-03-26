import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faHome } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
	return (
		<footer className="footer">
			<div className="footer-icon">
				<ul>
					<li>
						<a
							href="mailto:almondriverrecords@gmail.com"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon
								icon={faEnvelope}
								className="footer-icon"
							/>
							almondriverrecords@gmail.com
						</a>
					</li>
					<li>
						<a
							href="tel:+447729421682"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon icon={faPhone} className="footer-icon" />
							07729 421682
						</a>
					</li>
					<li>
						<a
							href="https://maps.app.goo.gl/7PSPh1NSHgHinheM9"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FontAwesomeIcon icon={faHome} className="footer-icon" />
							{`253 St John's Rd, Edinburgh EH12 7XD`}
						</a>
					</li>
				</ul>
			</div>
			<div className="socialWrapper">
				<div className="socialLinks">
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
			<div>
				<p>
					<Link href="/privacy">Privacy Policy</Link>
				</p>
				<p>© {new Date().getFullYear()} Almond River Records</p>
				<p>Made by DH</p>
			</div>
		</footer>
	);
}
