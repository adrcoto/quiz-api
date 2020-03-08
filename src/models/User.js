const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passwordMinLength = parseInt(process.env.PASSWORD_MIN_LENGTH);

/**
 * Defining user schema
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Provide a valid email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: [true, 'Choose a password'],
        trim: true,
        minlength: [passwordMinLength, `Password must contain at least ${passwordMinLength} characters`],
        validate(value) {
            if (value.toLowerCase().trim().includes('password')) {
                throw new Error('Password cannot contain \'password\'');
            }
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        passwordReset: {
            type: String
        },
        passwordResetExpires: Date
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

/**
 * Hide sensitive data
 * @returns {Array|*|{}}
 */
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.role;
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    delete userObject.avatar;

    return userObject;
};

/**
 * User schema methods
 */

/**
 * Generate JWT
 * @returns {Promise<undefined|*>}
 */
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
};

/**
 * Find user by email
 * @param email
 * @param password
 * @returns {Promise<*>}
 */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }
    if (!await bcrypt.compare(password, user.password)) {
        throw new Error('Unable to login.');
    }

    return user;
};


/**
 * Middleware to hash user password before save
 */
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    next();
});


/**
 * Creating User model
 * Applying user schema
 * @type {function(Object, *=, *=): void}
 */
const User = mongoose.model('User', userSchema);


module.exports = User;