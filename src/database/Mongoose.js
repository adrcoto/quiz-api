const mongoose = require('mongoose');
const { config } = require('../../config/app');


mongoose.connect(config.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});