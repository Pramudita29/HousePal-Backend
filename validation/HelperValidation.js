const Joi = require("joi");

const helperSchema = Joi.object({
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
    skills: Joi.array().items(Joi.string()).required().messages({
        'array.base': `"Skills" should be an array of strings`,
        'any.required': `"Skills" is a required field`
    }),
    experience: Joi.number().min(0).required().messages({
        'number.base': `"Experience" should be a number`,
        'number.min': `"Experience" should be greater than or equal to 0`,
        'any.required': `"Experience" is a required field`
    }),
    availability: Joi.string().valid("available", "not available").default("available").messages({
        'string.base': `"Availability" should be a type of 'text'`,
        'any.only': `"Availability" must be either 'available' or 'not available'`
    }),
    rating: Joi.number().min(0).max(5).default(0).messages({
        'number.base': `"Rating" should be a number`,
        'number.min': `"Rating" should be between 0 and 5`,
        'number.max': `"Rating" should be between 0 and 5`
    }),
    image: Joi.string().allow("",null).optional().messages({
        'string.uri': `"Profile Picture" must be a valid URL if provided`
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

function HelperValidation(req, res, next) {
    const { error } = helperSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = HelperValidation;
