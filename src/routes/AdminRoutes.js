const express = require('express');
const admin = require('../middleware/Admin');
const router = new express.Router();


const UserController = require('../controller/UserController');
const AdminController = require('../controller/AdminController');


/**
 * ------------------------------- Authenticate routes -------------------------------
 */


/**
 * ------------------------------- Profile routes -------------------------------
 */
/**
 * Create admin user
 */
router.post('/admin/users', admin, AdminController.create);

/**
 * Get users
 */
router.get('/admin/users', admin, AdminController.users);
/**
 * Update user -> [name, password]
 */
router.patch('/users/me', admin, UserController.update);

/**
 * Delete user
 */
router.delete('/users/me', admin, UserController.delete);

/**
 * ############################### END Profile ###############################
 */


module.exports = router;