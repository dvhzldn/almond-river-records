import Image from "next/image";

export default function AboutPage() {
	return (
		<section className="section">
			<div className="contact-info">
				<h1>About our shop</h1>
				<Image
					className="responsive-image"
					src="/images/shop-front.webp"
					alt="Almond River Records owner, Andy Barbour, standing outsite the shop"
					width={405}
					height={270}
					priority
				/>
				<p>
					Andy Barbour of Almond River Records outside the shop. (Image:
					Stuart Stott.)
				</p>
				<section className="opening-hours">
					<h4>Opening Hours</h4>
					<table>
						<tbody>
							<tr>
								<td>Monday</td>
								<td>11 am–5 pm</td>
							</tr>
							<tr>
								<td>Tuesday</td>
								<td>11 am–5 pm</td>
							</tr>
							<tr>
								<td>Wednesday</td>
								<td>11 am–5 pm</td>
							</tr>
							<tr>
								<td>Thursday</td>
								<td>11 am–5 pm</td>
							</tr>
							<tr>
								<td>Friday</td>
								<td>11 am–5 pm</td>
							</tr>
							<tr>
								<td>Saturday</td>
								<td>11 am–5 pm</td>
							</tr>
							<tr>
								<td>Sunday</td>
								<td>Closed</td>
							</tr>
						</tbody>
					</table>
				</section>

				<p className="text">
					Almond River Records shop is located in Corstorphine to the west
					of Edinburgh, easily accessible by public transport and with
					on-street parking nearby.
				</p>
				<p className="text">
					Drop by our shop to browse our extensive collection of records
					and have a chat about music with our friendly staff.
				</p>

				<div className="map">
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.2716520508266!2d-3.292032172948193!3d55.943045299878484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c707d04ceedd%3A0xbbb0601c0f2583d!2sAlmond%20River%20Records!5e0!3m2!1sen!2suk!4v1741922054158!5m2!1sen!2suk"
						allowFullScreen
						loading="lazy"
					></iframe>
				</div>
			</div>
		</section>
	);
}
