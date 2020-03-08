const express = require('express');
require('dotenv').config();
const https = require('https');
const fs = require('fs');
require('./database/Mongoose');

const userRoutes = require('./routes/UserRoutes');

let app = express();
app.use(express.json());

const key = fs.readFileSync(`${__dirname}/../cert/server.key`);
const cert = fs.readFileSync(`${__dirname}/../cert/server.crt`);

let server = https.createServer({ key, cert }, app);

/**
 * Endpoints
 */

app.use(userRoutes);

server.listen(parseInt(process.env.PORT), () => {
    console.log('Success!', `Secured development server started on port ${process.env.PORT}`);
});


/*
app.listen(parseInt(process.env.PORT), () => {
    console.log(`Production server started on port ${process.env.PORT}`);
});*/
