const Joi = require("joi");

const helperSchema = Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    contact_no: Joi.string().pattern(/^[0-9]{10}$/).required(), // Validates 10-digit number
    skills: Joi.array().items(Joi.string()).required(),
    experience: Joi.number().min(0).required(),
    availability: Joi.string().valid("available", "not available").default("available"),
    rating: Joi.number().min(0).max(5).default(0),
    profile_picture: Joi.string().uri().optional(), // Optional URL validation
});

function HelperValidation(req, res, next) {
    const { error } = helperSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = HelperValidation;
