const { config } = require('../../config/app');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: config.SMTP_HOST,
    auth: {
        user: config.SMTP_LOGIN,
        pass: config.SMTP_PASSWORD
    }
});


const sendConfirmationMail = (email, name, protocol, host, token) => {
    transporter.sendMail({
        from: `Team ${config.NAME} <${config.NAME}>`,
        to: email,
        subject: `Welcome to ${config.NAME}`,
        html: `<h2>Hello ${name},</h2><p>Please verify your account by clicking the following button</p><a href="${protocol}://${host}/confirmation/${token}">Verify</a>`
    }, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


const sendWelcomeAdminMail = (email, name) => {
    transporter.sendMail({
        from: `Team ${config.NAME} <${config.NAME}>`,
        to: email,
        subject: `Welcome to ${config.NAME} team`,
        text: `Hello ${name},\n\n We\'re glad to have you on board.`
    });
};

module.exports = {
    sendConfirmationMail,
    sendWelcomeAdminMail
};
