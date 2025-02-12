const Joi = require("joi");

const seekerSchema = Joi.object({
    fullName: Joi.string().required().messages({
        'string.base': `"Full Name" should be a type of 'text'`,
        'any.required': `"Full Name" is a required field`
    }),
    email: Joi.string().email().required().messages({
        'string.base': `"Email" should be a type of 'text'`,
        'string.email': `"Email" must be a valid email`,
        'any.required': `"Email" is a required field`
    }),
    contactNo: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.base': `"Contact Number" should be a type of 'text'`,
        'string.pattern.base': `"Contact Number" should be a valid 10-digit number`,
        'any.required': `"Contact Number" is a required field`
    }),

    image: Joi.string().uri().optional().messages({
        'string.uri': `"Image" must be a valid URL if provided`
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': `"Password" should be a type of 'text'`,
        'string.min': `"Password" must be at least 6 characters long`,
        'any.required': `"Password" is a required field`
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'string.base': `"Confirm Password" should be a type of 'text'`,
        'any.required': `"Confirm Password" is a required field`,
        'string.valid': `"Confirm Password" must match the Password`
    }),
});

function SeekerValidation(req, res, next) {
    const { error } = seekerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = SeekerValidation;
