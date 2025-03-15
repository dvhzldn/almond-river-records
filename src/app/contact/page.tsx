"use client"; // Required for client components

import { useForm, SubmitHandler } from "react-hook-form";

// Define TypeScript interface for form data
interface ContactFormInputs {
	name: string;
	email: string;
	message: string;
}

export default function ContactPage() {
	const { register, handleSubmit } = useForm<ContactFormInputs>();

	// Define the correct type for onSubmit
	const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
		console.log(data);
	};

	return (
		<section>
			<h1>Contact Us</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input {...register("name")} placeholder="Your Name" required />
				<input
					{...register("email")}
					type="email"
					placeholder="Your Email"
					required
				/>
				<textarea
					{...register("message")}
					placeholder="Your Message"
					required
				/>
				<button type="submit">Send</button>
			</form>
		</section>
	);
}
