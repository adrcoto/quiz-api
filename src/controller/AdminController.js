const User = require('../model/User');
const { returnError } = require('../services/Response');
const { sendWelcomeAdminMail } = require('../services/Email');
const { isValidOperation, filterData } = require('../services/Util');


/**
 * Create admin account
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.create = async (req, res) => {
    try {
        const user = new User(req.body);
        user.isVerified = true;
        await user.save();
        sendWelcomeAdminMail(user.email, user.name);
        res.status(201).send({ type: 'success', user });
    } catch (error) {
        returnError(res, 'validation-error', 400, error);
    }
};

/**
 * Read users
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.users = async (req, res) => {
    const filterObject = filterData(req.query, ['role']);
    const queries = filterObject.queries;
    const limit = filterObject.limit;
    const skip = filterObject.skip;
    const sort = filterObject.sort;

    try {
        const users = await User.find(queries).sort(sort).limit(limit).skip(skip);
        if (!users) {
            return res.status(404).send();
        }
        res.send(users);
    } catch (error) {
        res.status(400).send();
    }
};

/**
 * U
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.patch = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'role', 'isVerified'];

    if (!isValidOperation(updates, allowedUpdates)) {
        throw new Error('Invalid updates');
    }

    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.statsu(404).send();
        }

        updates.forEach((update) => {
            user[update] = req.body[update];
        });

        await user.save();

        res.send(user);
    } catch (error) {
        res.status(400).send();
    }
};

/**
 * Delete user by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.delete = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).send();
        }

        user.remove();
        res.send(user);
    } catch (error) {
        res.status(500).send();
    }
};