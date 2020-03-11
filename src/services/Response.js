const returnError = (res, type, status, error) => {
    let errors = {};

    if (error.message === 'There is already an account associated with this email') {
        errors['email'] = 'There is already an account associated with this email';
    } else {
        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
        });
    }

    res.status(status).send({ type, errors });
};


module.exports = {
    returnError
};