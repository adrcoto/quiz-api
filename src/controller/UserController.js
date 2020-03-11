const sharp = require('sharp');
const crypto = require('crypto');
const multer = require('multer');
const User = require('../model/User');
const Token = require('../model/RegisterToken');

const { sendConfirmationMail } = require('../services/Email');
const { returnError } = require('../services/Response');


/**
 * Avatar rules
 * @type {Multer|undefined}
 */
module.exports.upload = multer({
    limits: {
        fileSize: 4194304 // 4mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'));
        }

        cb(undefined, true);
    }
});


/**
 * ------------------------------- Authenticate  -------------------------------
 */

/**
 * Register user
 */
module.exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        // const token = await user.generateAuthToken();

        const confirmToken = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });

        await confirmToken.save();
        sendConfirmationMail(user.email, user.name, req.protocol, req.headers.host, confirmToken.token);
        res.status(201).send({ type: 'success', user });
    } catch (error) {
        // res.status(400).send(error.message);
        returnError(res, 'validation-error', 400, error);
    }
};

module.exports.resendEmailConfirmation = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(404).send();
        }

        const confirmToken = await Token.findOne({ _userId: user._id });
        if (!confirmToken) {
            res.status(404).send();
        }


        sendConfirmationMail(user.email, user.name, req.protocol, req.headers.host, confirmToken.token);
        res.send();
    } catch (error) {
        res.status(400).send();
    }
};

/**
 * Confirm user
 */
module.exports.confirmUser = async (req, res) => {
    const token = await Token.findOne({ token: req.params.token });
    if (!token) {
        return res.status(400).send({
            type: 'not-verified',
            message: 'We were unable to find a valid token. Your token my have expired.'
        });
    }

    const user = await User.findOne({ _id: token._userId });
    if (!user) {
        return res.status(404).send({ message: 'We were unable to find a user for this token.' });
    }

    if (user.isVerified) {
        return res.status(400).send({
            type: 'already-verified',
            message: 'This user has already been verified.'
        });
    }

    user.isVerified = true;
    await user.save();
    await token.remove();

    res.send('Your account has been verified. You may log in');
};

/**
 * Login user
 */
module.exports.login = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if (!user.isVerified) {
            return res.status(401).send({
                type: 'not-verified',
                message: 'Your account has not been verified. Check your mail inbox'
            });
        }
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

/**
 * Logout user
 */
module.exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
};

/**
 * Logout user from all devices
 */
module.exports.logoutAll = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }

};

/**
 * ############################### END Authenticate ###############################
 */


/**
 * ------------------------------- Profile  -------------------------------
 */

/**
 * Get logged user
 */
module.exports.getLoggedUser = async (req, res) => {
    res.send(req.user);
};

/**
 * Update user -> [name, password]
 */
module.exports.update = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'role', 'isVerified'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        res.send(req.user);
    } catch (error) {
        res.statsu(400).send(error);
    }
};


/**
 * Delete user
 */
module.exports.delete = async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * Upload user profile pic
 */
module.exports.uploadAvatar = async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    await req.user.save();
    res.send();
};

/**
 * Delete user profile pic
 */
module.exports.deleteAvatar = async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(400).send();
    }
};

/**
 * Get user profile pic by id
 */
module.exports.getAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
};
/**
 * ############################### END Profile ###############################
 */
