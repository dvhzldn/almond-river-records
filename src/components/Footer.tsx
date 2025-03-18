import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
	return (
		<footer className="footer">
			<div className="contact">
				<ul>
					<li>
						<Link href="/returns">Returns Policy</Link>
					</li>
					<p>Enquiries:</p>
					<li>
						<Link href="mailto:almondriverrecords@gmail.com">
							almondriverrecords@gmail.com
						</Link>
					</li>

					<p>Call us:</p>
					<li>
						<Link href="tel:+447729421682">07729 421682</Link>
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
				<p className="copyright">
					© {new Date().getFullYear()} Almond River Records
				</p>
				<br />
				<p className="copyright">Made by Dave</p>
			</div>
		</footer>
	);
}
