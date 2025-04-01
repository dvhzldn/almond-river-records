import { Resend } from "resend";

export interface ContactFormData {
	full_name: string;
	contact_email: string;
	phone_number: string;
	user_message: string;
}

export async function sendContactEmail(data: ContactFormData) {
	const resend = new Resend(process.env.RESEND_TRANSACTIONAL_API_KEY!);

	const text = `
Contact Form Submission

Name: ${data.full_name}
Email: ${data.contact_email}
${data.phone_number ? `Phone: ${data.phone_number}\n` : ""}

Message:
${data.user_message}

—
Almond River Records
`;

	const toEmail = process.env.CONTACT_NOTIFICATION_EMAIL || "";

	try {
		await resend.emails.send({
			from: "Almond River Records Contact Form <noreply@orders.almondriverrecords.online>",
			to: [toEmail],
			subject: "Contact Form Submission",
			replyTo: data.contact_email,
			text,
		});
		console.log("📬 Contact form email sent");
	} catch (err) {
		console.error("❌ Failed to send contact email:", err);
		throw err;
	}
}
