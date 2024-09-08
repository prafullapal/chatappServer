const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({ email, verificationOTP, host }) => {
	const message = `<div><p>Please verify your email using the OTP below to activate your account: </p>
${verificationOTP}</div>`;
	console.log(message);
	return sendEmail({
		to: email,
		subject: "Email Confirmation",
		html: `<h4> Greetings from Vartalaap</h4>${message}`,
	});
};

module.exports = sendVerificationEmail;
