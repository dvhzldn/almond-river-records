export default function Privacy() {
	return (
		<div className="page-container">
			<h1 className="page-title">Privacy Policy</h1>

			<div className="content-box text privacy">
				<section aria-labelledby="privacy-heading">
					<h2 id="privacy-heading">Almond River Records Privacy Policy</h2>
					<p>
						<strong>Last Updated:</strong> March 2025
					</p>

					<p>
						At Almond River Records, we are committed to protecting your
						privacy and ensuring that your personal information is handled
						in a safe and responsible manner. This policy explains how we
						collect, use, store, and protect your data when you visit our
						website or our in-person record shop.
					</p>

					<hr />

					<h3>1. Information We Collect</h3>
					<p>
						We only collect the following personal data through our order
						form:
					</p>
					<ul>
						<li>Name</li>
						<li>Email address</li>
						<li>Postal address</li>
					</ul>
					<p>
						This information is collected solely for the purpose of
						processing and delivering your order.
					</p>

					<hr />

					<h3>2. How We Use Your Information</h3>
					<p>The personal data you provide is used for:</p>
					<ul>
						<li>Processing your order</li>
						<li>
							Communicating with you regarding your order (e.g.,
							confirmation, updates, support)
						</li>
						<li>Complying with any applicable legal obligations</li>
					</ul>
					<p>We do not use your information for any other purposes.</p>

					<hr />

					<h3>3. Payment Information</h3>
					<p>
						Please note that Almond River Records does not store payment
						card details. All payment processing is handled securely by
						our third-party payment service provider.
					</p>

					<hr />

					<h3>4. Data Retention</h3>
					<p>
						We retain your personal data for 12 months from the date of
						your order. After this period, your information will be
						securely deleted unless required by law to retain it longer.
					</p>

					<hr />

					<h3>5. Data Security</h3>
					<p>
						We implement appropriate technical and organizational measures
						to protect your personal data from unauthorized access,
						disclosure, alteration, or destruction. While no method of
						transmission or storage is completely secure, we take
						reasonable steps to safeguard your information.
					</p>

					<hr />

					<h3>6. Your Rights</h3>
					<p>
						Under the UK Data Protection Act and GDPR, you have the right
						to:
					</p>
					<ul>
						<li>Access your personal data</li>
						<li>Request correction of inaccurate or incomplete data</li>
						<li>
							Request deletion of your data (subject to legal
							requirements)
						</li>
						<li>Object to or restrict the processing of your data</li>
					</ul>
					<p>
						To exercise any of these rights, please contact us using the
						details provided in the Contact Us section below.
					</p>

					<hr />

					<h3>7. Changes to This Privacy Policy</h3>
					<p>
						We may update this Privacy Policy from time to time. Any
						changes will be posted on this page along with an updated
						effective date. We encourage you to review our Privacy Policy
						periodically.
					</p>

					<hr />

					<h3>8. Contact Us</h3>
					<p>
						If you have any questions or concerns about this Privacy
						Policy or our data practices, please contact us at:
					</p>

					<address className="policy">
						<p>
							<strong>Almond River Records</strong>
						</p>
						<p>{`253 St John's Rd, Edinburgh EH12 7XD`}</p>
						<p>
							Email:{" "}
							<a href="mailto:almondriverrecords@gmail.com">
								almondriverrecords@gmail.com
							</a>
						</p>
						<p>
							Telephone: <a href="tel:+447729421682">07729 421682</a>
						</p>
					</address>
				</section>
			</div>
		</div>
	);
}
