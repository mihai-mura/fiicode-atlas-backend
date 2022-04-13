import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendPassRecoverMail = async (to, link) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: to,
		subject: 'Password Recovery',
		text: `Click this link to recover your password: http://localhost:3000/recover/${link}`,
	};
	await transporter
		.sendMail(mailOptions)
		.then(() => {
			console.log(`Email sent to: ${to}`);
		})
		.catch((error) => {
			console.log(error);
		});
};
