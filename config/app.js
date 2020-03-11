'use strict';
require('dotenv').config();


const config = {
    NAME: process.env.APP_NAME,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_LOGIN: process.env.SMTP_LOGIN,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    DB_URI: process.env.DB_URI,
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
};

module.exports = { config };
