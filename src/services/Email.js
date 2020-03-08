const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});


const sendConfirmationMail = (email, name, protocol, host, token) => {
    transporter.sendMail({
        from: `Team ${process.env.APP_NAME} <${process.env.APP_NAME}>`,
        to: email,
        subject: `Welcome to ${process.env.APP_NAME}`,
        html: `<h2>Hello ${name},</h2><p>Please verify your account by clicking the following button</p><a href="${protocol}://${host}/confirmation/${token}">Verify</a>`
    });
};


module.exports = {
    sendConfirmationMail
};
