const express = require('express');
const auth = require('../middleware/Auth');
const router = new express.Router();


const UserController = require('../controller/UserController');


const upload = UserController.upload;


/**
 * ------------------------------- Authenticate routes -------------------------------
 */

/**
 * Register user
 */
router.post('/users', UserController.register);

/**
 * Resend user confirmation
 */
router.post('/confirmation/resend', UserController.resendEmailConfirmation);
/**
 * Confirm user
 */
router.get('/confirmation/:token', UserController.confirmUser);

/**
 * Login user
 */
router.post('/users/login', UserController.login);

/**
 * Logout user
 */

router.post('/users/logout', auth, UserController.logout);

/**
 * Logout user from all devices
 */
router.post('/users/logoutAll', auth, UserController.logoutAll);
/**
 * ############################### END Authenticate ###############################
 */


/**
 * ------------------------------- Profile routes -------------------------------
 */

/**
 * Get logged user
 */
router.get('/users/me', auth, UserController.getLoggedUser);

/**
 * Update user -> [name, password]
 */
router.patch('/users/me', auth, UserController.update);


/**
 * Delete user
 */
router.delete('/users/me', auth, UserController.delete);

/**
 * Upload user profile pic
 */
router.post('/users/me/avatar', auth, upload.single('avatar'), UserController.uploadAvatar,
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

/**
 * Delete user profile pic
 */
router.delete('/users/me/avatar', auth, UserController.deleteAvatar);

/**
 * Get user profile pic by id
 */
router.get('/users/:id/avatar', UserController.getAvatar);

/**
 * ############################### END Profile ###############################
 */


module.exports = router;