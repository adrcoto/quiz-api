const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/User');
const auth = require('../middleware/Auth');

const router = new express.Router();


/**
 * Avatar rules
 * @type {Multer|undefined}
 */
const upload = multer({
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


router.get('/', (req, res) => {
    res.send('Oke');
});

/**
 * ------------------------------- Authenticate routes -------------------------------
 */

/**
 * Register user
 */
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

/**
 * Login user
 */
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/**
 * Logout user
 */
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

/**
 * Logout user from all devices
 */
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }

});

/**
 * ############################### END Authenticate ###############################
 */


/**
 * ------------------------------- Profile routes -------------------------------
 */

/**
 * Get logged user
 */
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

/**
 * Update user -> [name, password]
 */
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password'];

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

});


/**
 * Delete user
 */
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * Upload user profile pic
 */
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

/**
 * Delete user profile pic
 */
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(400).send();
    }
});

/**
 * Get user profile pic by id
 */
router.get('/users/:id/avatar', async (req, res) => {
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

});
/**
 * ############################### END Profile ###############################
 */


module.exports = router;