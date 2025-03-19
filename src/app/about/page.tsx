import Image from "next/image";

export default function AboutPage() {
	return (
		<section className="section">
			<h1>About Our Shop</h1>
			<div>
				<p className="text">
					Our shop opened in December 2021, located in Corstorphine to the
					west of Edinburgh.
				</p>
				<br />
				<p className="text">
					Easily accessible by public transport, convenient on-street
					parking can be found nearby.
				</p>
			</div>
			<div className="info-container">
				<div className="map">
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.2716520508266!2d-3.292032172948193!3d55.943045299878484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c707d04ceedd%3A0xbbb0601c0f2583d!2sAlmond%20River%20Records!5e0!3m2!1sen!2suk!4v1741922054158!5m2!1sen!2suk"
						allowFullScreen
						loading="lazy"
					></iframe>
				</div>

				<div className="shop-image-container">
					<Image
						className="responsive-image"
						src="/images/shop-front.webp"
						alt="Almond River Records owner, Andy Barbour, standing outside the shop"
						width={405}
						height={270}
						priority
					/>
					{/* <p>Andy of Almond River Records outside the shop.</p>
					<p>Image: Stuart Stott.</p> */}
				</div>
			</div>
			<div className="opening-hours-container">
				<h4>Opening Hours</h4>
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
			<div>
				<p className="text">
					Drop by our shop to browse our extensive collection of records
					and have a chat about music with our friendly staff.
				</p>
			</div>
		</section>
	);
}
