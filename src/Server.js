const express = require('express');
const { config } = require('../config/app');
const https = require('https');
require('./database/Mongoose');

const adminRoutes = require('./routes/AdminRoutes');
const userRoutes = require('./routes/UserRoutes');
const quizRoutes = require('./routes/QuizRoutes');

let app = express();
app.use(express.json());

// require('../config/error')(app);
/**
 * Endpoints
 */

app.use(adminRoutes);
app.use(userRoutes);
app.use(quizRoutes);

app.get('/', (req, res) => {
    res.send('Oke');
});


if (config.ENV !== 'production') {
    const fs = require('fs');
    const key = fs.readFileSync(`${__dirname}/../cert/server.key`);
    const cert = fs.readFileSync(`${__dirname}/../cert/server.crt`);
    let server = https.createServer({ key, cert }, app);
    server.listen(parseInt(process.env.PORT), () => {
        console.log('Success!', `Secured development server started on port ${process.env.PORT}`);
    });
} else {
    app.listen(parseInt(process.env.PORT), () => {
        console.log(`Production server started on port ${process.env.PORT}`);
    });
}


