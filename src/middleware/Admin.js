const jwt = require('jsonwebtoken');
const User = require('../model/User');

const admin = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }
        if (user.role !== 'admin') {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ type: 'unauthorized', message: 'You don\'t have rights to this operation' });
    }
};


module.exports = admin;