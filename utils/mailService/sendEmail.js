const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		secure: true,
		auth: {
			user: process.env.NODEMAILER_EMAIL,
			pass: process.env.NODEMAILER_PASS,
		},
	});

	return transporter.sendMail({
		from: `Vartalaap <${process.env.NODEMAILER_EMAIL}>`,
		to,
		subject,
		html,
	});
};

module.exports = sendEmail;
