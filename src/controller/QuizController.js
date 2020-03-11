const Quiz = require('../model/Quiz');
const multer = require('multer');
const { returnError } = require('../services/Response');
const { isValidOperation, filterData } = require('../services/Util');


/**
 * Quiz file rules
 * @type {Multer|undefined}
 */
module.exports.upload = multer({
    limits: {
        fileSize: 104857675 // 1mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(JSON)$/)) {
            return cb(new Error('Please upload a valid JSON file'));
        }

        cb(undefined, true);
    }
});

/**
 * Create quiz
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.create = async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).send(quiz);
    } catch (error) {
        returnError(res, 'validation-error', 400, error);
    }
};


module.exports.uploadQuiz = async (req, res) => {
    try {
        const file = req.file.buffer;


        const quizzes = JSON.parse(file).quizzes;
        await Quiz.insertMany(quizzes);
        res.send();
    } catch (error) {
        returnError(res, 'validation-error', 400, error);
    }
};


/**
 * Read quizzes
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.read = async (req, res) => {
    const filterObject = filterData(req.query, ['name', 'category', 'difficulty']);
    const queries = filterObject.queries;
    const sort = filterObject.sort;
    const limit = filterObject.limit;
    const skip = filterObject.skip;

    try {
        const quizzes = await Quiz.find(queries).sort(sort).limit(limit).skip(skip);
        res.send(quizzes);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * Read quiz by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.readById = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id });
        if (!quiz) {
            return res.status(404).send();
        }
        res.send(quiz);
    } catch (error) {
        res.status(400).send();
    }
};

/**
 * Update quiz
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.update = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'category', 'difficulty', 'questions', 'query', 'answer', 'right'];

    if (!isValidOperation(updates, allowedUpdates)) {
        return res.status(400).send('Invalid updates');
    }

    await Quiz.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true }, (error, quiz) => {
        if (error) {
            error.status = 406;
            return next(error);
        } else if (!quiz) {
            return res.status(400).send({ message: 'Cannot perform the operation' });
        }
        res.send(quiz);
    });

};

/**
 * Delete quiz
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.delete = async (req, res) => {
    try {
        await Quiz.deleteOne({ _id: req.params.id });
        res.send();
    } catch (error) {
        res.status(500).send();
    }
};
