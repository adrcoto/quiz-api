const express = require('express');

const QuizController = require('../controller/QuizController');
const admin = require('../middleware/Admin');
const router = new express.Router();

const upload = QuizController.upload;
/**
 * Create quiz
 */
router.post('/quizzes', admin, QuizController.create);


/**
 * Upload quiz file
 */
router.post('/quizzes/upload', admin, upload.single('file'), QuizController.uploadQuiz,
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);
/**
 * Read quizzes
 */
router.get('/quizzes', QuizController.read);

/**
 * Read quiz by id
 */
router.get('/quizzes/:id', QuizController.readById);

/**
 * Update quiz
 */
router.patch('/quizzes/:id', admin, QuizController.update);

/**
 * Delete quiz
 */
router.delete('/quizzes/:id', admin, QuizController.delete);


module.exports = router;