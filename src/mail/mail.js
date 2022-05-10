import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import handlebars from 'nodemailer-express-handlebars';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const handlebarsOptions = {
	viewEngine: {
		extName: '.handlebars',
		partialsDir: path.resolve('./src/mail/templates'),
		defaultLayout: false,
	},
	viewPath: path.resolve('./src/mail/templates'),
	extName: '.handlebars',
};

transporter.use('compile', handlebars(handlebarsOptions));

export const sendPassRecoverMail = async (to, link) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: to,
		subject: 'Password Recovery',
		template: 'passRecovery',
		context: {
			link: `http://localhost:3000/recover-password/${link}`,
		},
		attachments: [
			{
				filename: 'logo-cityq.png',
				path: path.resolve('./src/mail/images/logo-cityq.png'),
				cid: 'logo',
			},
		],
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

export const sendPostRejectedMail = async (to) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: to,
		subject: 'Post Rejected',
		template: 'postRejected',
		attachments: [
			{
				filename: 'logo-cityq.png',
				path: path.resolve('./src/mail/images/logo-cityq.png'),
				cid: 'logo',
			},
		],
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

export const sendUserRejectedMail = async (to) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: to,
		subject: 'Address verification failed',
		template: 'userRejected',
		attachments: [
			{
				filename: 'logo-cityq.png',
				path: path.resolve('./src/mail/images/logo-cityq.png'),
				cid: 'logo',
			},
		],
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
