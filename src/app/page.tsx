import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import NewThisWeek from "@/components/NewThisWeek";

export default function Home() {
	return (
		<section className="section">
			<h1>Almond River Records</h1>
			<Image
				className="logo"
				src="/images/almond-river-logo.jpg"
				alt="Almond River Records logo"
				width={300}
				height={300}
				priority
			/>

			<div>
				<NewThisWeek />
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
		</section>
	);
}
