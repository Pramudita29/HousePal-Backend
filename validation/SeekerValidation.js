const Joi = require("joi");

const seekerSchema = Joi.object({
    full_name: Joi.string().required(),
    address: Joi.string().required(),
    contact_no: Joi.string().pattern(/^[0-9]{10}$/).required(), // Validates 10-digit number
    email: Joi.string().email().required(),
    image: Joi.string().uri().optional(), // Optional URL validation
});

function SeekerValidation(req, res, next) {
    const { error } = seekerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = SeekerValidation;
