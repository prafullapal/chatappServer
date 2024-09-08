const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ email, otp, host }) => {
	const message = `<div><p>Please reset your password using the OTP below to verify your account: </p>
${otp}</div>`;
	console.log(message);
	return sendEmail({
		to: email,
		subject: "Reset Password Verification",
		html: `<h4> Greetings from Vartalaap</h4>${message}`,
	});
};

module.exports = sendResetPasswordEmail;
