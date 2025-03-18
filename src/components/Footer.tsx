import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
	return (
		<footer className="footer">
			<div>
				<ul>
					<p>
						Enquiries:{` `}
						<Link
							href="mailto:almondriverrecords@gmail.com"
							target="_blank"
							rel="noopener noreferrer"
						>
							almondriverrecords@gmail.com
						</Link>
					</p>
					<p>
						Call us:{` `}
						<Link href="tel:+447729421682">07729 421682</Link>
					</p>
					<p>
						Visit us:{` `}
						<Link
							href="https://maps.app.goo.gl/7PSPh1NSHgHinheM9"
							target="_blank"
							rel="noopener noreferrer"
						>
							{`253 St John's Rd, Edinburgh EH12 7XD`}
						</Link>
					</p>
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
					<Link href="/returns">Returns Policy</Link>
				</p>
				<p>© {new Date().getFullYear()} Almond River Records</p>
				<p>Made by Dave</p>
			</div>
		</footer>
	);
}
