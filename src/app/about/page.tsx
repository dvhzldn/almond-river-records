import Image from "next/image";
import Link from "next/link";
export default function AboutPage() {
	return (
		<div className="page-container">
			<h1 className="page-title">About Our Shop</h1>

			<div className="content-box">
				{/* First Section (Text Left, Image Right) */}
				<div className="two-column-layout">
					<div className="text-content">
						<h2>Our Location</h2>
						<p>
							Shop address:{" "}
							<a
								href="https://maps.app.goo.gl/7PSPh1NSHgHinheM9"
								target="_blank"
								rel="noopener noreferrer"
							>
								{`253 St John's Rd, Edinburgh EH12 7XD`}
							</a>
						</p>
						<p>
							Almond River Records shop is located in Corstorphine to the
							west of Edinburgh.
						</p>
						<p>
							Easily accessible by public transport, you can find
							convenient on-street parking nearby.
						</p>
					</div>

					<div className="map">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.2716520508266!2d-3.292032172948193!3d55.943045299878484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c707d04ceedd%3A0xbbb0601c0f2583d!2sAlmond%20River%20Records!5e0!3m2!1sen!2suk!4v1741922054158!5m2!1sen!2suk"
							allowFullScreen
							loading="lazy"
						></iframe>
					</div>
				</div>

				{/* Second Section (Image Left, Text Right) */}
				<div className="two-column-layout reverse">
					<div className="opening-hours-container">
						<h3>Shop Opening Hours</h3>
						<table className="opening-hours">
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
					</div>

					<div className="text-content">
						<h2>Get In Touch</h2>
						<p>
							Drop by our shop in Corstorphine to browse our extensive
							collection of records and have a chat about music with our
							friendly staff.
						</p>
						<p>
							Reach out to us by filling in{" "}
							<Link href="/contact" className="hyperLink">
								our contact form
							</Link>{" "}
							and we will get back to you.
						</p>
						<p>
							For any urgent enquiries, please call Andy on{" "}
							<a
								href="tel:+447729421682"
								className="hyperLink"
								target="_blank"
								rel="noopener noreferrer"
							>
								07729 421682
							</a>
							.
						</p>
						<p>
							You can also reach us by email at{" "}
							<a
								href="mailto:almondriverrecords@gmail.com"
								className="hyperLink"
							>
								almondriverrecords@gmail.com
							</a>
							.
						</p>
					</div>
				</div>

				{/* Third Section (Text Left, Image Right) */}
				<div className="two-column-layout">
					<div className="text-content">
						<h2>Our History</h2>
						<p>
							<em>
								“Once you start collecting records you develop an
								attachment to them.
							</em>
							<em>
								There are different things that you get hold of and they
								mean something to you. Whether it is the music itself or
								the art work that comes with it.“
							</em>
						</p>
						<p>
							{" "}
							Almond River Records started as an online record shop on
							Christmas Eve 2020, but expanded to open a physical shop in
							December 2021 after a unit became available during
							lockdown.
						</p>
						<p>
							We hope to create an environment that is welcoming for all
							record lovers - with customers able to leave with a £5
							album or a more expensive collector style item.
						</p>
					</div>

					<div className="image-container">
						<p>Andy of Almond River Records outside the shop.</p>
						<Image
							src="/images/shop-front.webp"
							alt="Turntable with Sister Ray Logo"
							width={500}
							height={350}
							className="responsive-image"
							priority
						/>
						<p>
							<em>Image: Stuart Stott</em>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
