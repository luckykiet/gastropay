
const nodemailer = require('nodemailer');
const mailConfig = require('./config/mail')

const mailBody = (header, body, footer) => {
    return `
	<div style="background-color:#363636;color:#f5f5f5;margin:30px;box-sizing:border-box;font-size:20px;">
		<h1 style="padding:40px;box-sizing:border-box;font-size:24px;color:#ffffff;background-color:#00d1b2;margin:0;">${header}</h1>
		<div style="box-sizing:border-box;padding:40px 40px;">
	        ${body}
		</div>
		<p style="padding:20px 40px 60px 40px;margin:0;box-sizing:border-box;font-size:16px;">
			${footer}
		</p>
	</div>
        `;
}

const sendMailWrapper = async (to, subject, header, body, footer) => {
    try {
        const transport = nodemailer.createTransport({
            host: mailConfig.HOST,
            port: mailConfig.PORT,
            secure: mailConfig.USE_TLS,
            auth: {
                user: mailConfig.USERNAME,
                pass: mailConfig.PASSWORD,
            }
        });

        const options = {
            from: mailConfig.USERNAME,
            to: to,
            subject: subject,
            html: mailBody(header, body, footer)
        };

        const result = await transport.sendMail(options);
        return result;
    } catch (error) {
        throw error;
    }
}


module.exports = sendMailWrapper;