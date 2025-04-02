import Image from "next/image";
import Link from "next/link";

export default function RecordCleaning() {
	return (
		<div className="page-container">
			<h1 className="page-title">Vinyl Record Cleaning Service</h1>

			<div className="content-box">
				<section
					className="two-column-layout"
					aria-labelledby="record-cleaning-heading"
				>
					<div className="text-content">
						<h2 id="record-cleaning-heading">In-Store Record Cleaning</h2>
						<p>
							Priced at:{` `}
							<strong>£1.70 per disc</strong> or{` `}
							<strong>£15 for 10 discs</strong>
						</p>

						<p>
							We know how important it is to keep your vinyl collection
							in pristine condition. Whether you are a seasoned collector
							or a casual listener, a well-maintained record can make all
							the difference to your listening experience.
						</p>

						<p>
							Our in-store record cleaning service uses
							professional-grade equipment to gently and effectively
							clean your discs — removing dirt, dust, and grime.
						</p>

						<p>
							Drop by{" "}
							<Link href="/shop" className="hyperLink">
								our shop in Corstorphine
							</Link>{" "}
							anytime during our opening hours, and we’ll get your
							records back to their best. Just bring them in — we’ll take
							care of the rest!
						</p>
					</div>
					<div className="image-container">
						<figure>
							<Image
								src="/images/record-cleaning.jpg"
								alt="Close-up of a vinyl record being cleaned with professional-grade equipment"
								width={500}
								height={450}
								className="responsive-image"
								sizes="(max-width: 768px) 100vw, 250px"
								quality={60}
								loading="lazy"
							/>
							<figcaption className="sr-only">
								Vinyl record cleaning service available in-store at
								Almond River Records.
							</figcaption>
						</figure>
					</div>
				</section>
			</div>
		</div>
	);
}
