import Link from "next/link";

export default function Help() {
	return (
		<div className="page-container">
			<h1 className="page-title">Help</h1>
			<div className="content-box">
				<h2>Frequently Asked Questions</h2>
				<br />
				<>
					<h2>What is Almond River Records?</h2>
					<p className="text">
						Almond River Records is a dedicated second-hand vinyl record
						shop based in the UK. We offer a curated collection of
						classic, rare, and contemporary records both in our physical
						store and online, ensuring that music lovers can enjoy the
						tactile and nostalgic experience of vinyl wherever they are.
					</p>

					<h2>Where are you located?</h2>
					<p className="text">
						Our brick-and-mortar shop is located in Corstorphine,
						Edinburgh. Come visit us during our opening hours to browse
						our collection in person and chat with our knowledgeable staff
						about your favourite genres and artists.
					</p>

					<h2>Can I buy records online?</h2>
					<p className="text">
						Yes! Our online store is open 24/7, and we offer shipping
						within the UK only. Browse our catalogue from the comfort of
						your home.
					</p>

					<h2>How do I know if a record is in good condition?</h2>
					<p className="text">
						We take pride in our quality checks. You can even select by
						vinyl condition on our website to suit your preferences. Each
						record is thoroughly inspected for sound quality and physical
						condition, and any imperfections are detailed in our online
						listings so you know exactly what to expect.
					</p>

					<h2>Do you offer record cleaning services?</h2>
					<p className="text">
						Yes, we do! In addition to our careful inspection process, we
						offer professional record cleaning equipment on the premises.
						You’re welcome to bring in your vinyl to have it cleaned. For
						more details, please visit{" "}
						<Link href="/record-cleaning">/record-cleaning</Link>.
					</p>

					<h2>Do you accept records on consignment?</h2>
					<p className="text">
						Absolutely. If you have a collection or individual records
						that you’d like to sell, please get in touch. We offer
						consignment options as well as direct purchase for select
						items. Our staff can guide you through the process and provide
						a fair valuation.
					</p>

					<h2>What payment methods do you accept?</h2>
					<p className="text">
						For both online and in-store purchases, we accept a variety of
						payment methods including major credit/debit cards, PayPal,
						and cash (in-store only). Please check our website’s payment
						page for the most up-to-date details.
					</p>

					<h2>How are records shipped?</h2>
					<p className="text">
						We pack our records with extra care to ensure they arrive
						safely. Orders are dispatched promptly via reliable postal
						services within the UK, and you will receive a tracking number
						once your order has shipped.
					</p>

					<h2>What is your returns policy?</h2>
					<p className="text">
						We offer a 30-day returns period. If you encounter any issues
						with your order, please contact us within 30 days of delivery
						to discuss your options. You can read our full returns policy
						at <Link href="/returns">/returns</Link>.
					</p>

					<h2>How often do you update your stock?</h2>
					<p className="text">
						Our inventory is updated almost daily as new finds and rare
						gems come in. Sign up for our newsletter or follow us on
						social media to stay informed about new arrivals, special
						editions, and exclusive offers.
					</p>

					<h2>Do you host in-store events?</h2>
					<p className="text">
						Yes, we occasionally host in-store events and listening
						sessions. Keep an eye on our events calendar online and our
						social media channels for the latest details.
					</p>

					<h2>How can I get in touch?</h2>
					<p className="text">
						If you have any other questions, feel free to get in touch
						using our contact form at{" "}
						<Link href="/contact">/contact</Link>, email us at
						almondriverrecords@gmail.com, or call 07729 421682. Our
						friendly team is always happy to help.
					</p>
				</>
			</div>
		</div>
	);
}
