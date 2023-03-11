
const config = require('./config/config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: 587,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_APP_PASSWORD,
    },
});

const mailBody = (header, body, footer) => {
    return `
	<div style="background-color:#fff;margin:30px;box-sizing:border-box;font-size:16px;">
		<h1 style="padding:40px;box-sizing:border-box;font-size:24px;color:#ffffff;background-color:#50688c;margin:0;">${header}</h1>
		<div style="box-sizing:border-box;padding:0 40px;">
            <p>
	            ${body}
            </p>
		</div>
		<p style="padding:20px 40px 60px 40px;margin:0;box-sizing:border-box;font-size:16px;">
			${footer}
		</p>
	</div>
        `;
}

const sendEmail = (to, subject, header, body, footer) => {
    const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to,
        subject,
        text: mailBody(header, body, footer),
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}

module.exports = sendEmail;