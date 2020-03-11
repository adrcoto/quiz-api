const mongoose = require('mongoose');
const validator = require('validator');

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Provide a name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    difficulty: {
        type: Number,
        required: [true, 'Provide a difficulty level'],
        min: 0,
        max: 2,
        validate(value) {
            if (value < 0 || value > 2) {
                throw new Error('Invalid difficulty');
            }
        }
    },
    category: {
        type: String,
        required: [true, 'Provide a category'],
        trim: true
    },
    questions: [
        {
            query: {
                type: String,
                required: true,
                trim: true
            },
            answers: [],
            right: []
        }
    ]
}, {
    timestamps: true
});

/**
 * Hide sensitive data
 * @returns {Array|*}
 */
quizSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.questions;
    delete userObject.__v;
    return userObject;
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;