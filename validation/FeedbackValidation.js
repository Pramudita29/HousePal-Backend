const Joi = require("joi");

const feedbackSchema = Joi.object({
    HelperId: Joi.string().required(),
    seekerId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comments: Joi.string().allow("").optional(), // Allow empty or optional
    date: Joi.date().default(Date.now),
});

function FeedbackValidation(req, res, next) {
    const { error } = feedbackSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = FeedbackValidation;
