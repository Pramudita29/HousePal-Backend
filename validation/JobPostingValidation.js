const Joi = require("joi");

const jobPostingSchema = Joi.object({
    seekerId: Joi.string().required(),
    jobDetails: Joi.string().required(),
    category: Joi.string().required(),
    reference_images: Joi.array().items(Joi.string().uri()).optional(),
    location: Joi.string().required(),
    salaryRange: Joi.string().required(),
    contractType: Joi.string().required(),
    applicationDeadline: Joi.date().required(),
    contactInfo: Joi.string().required(),
    status: Joi.string().valid("open", "booked", "completed", "cancelled").default("open"),
});

function JobPostingValidation(req, res, next) {
    const { error } = jobPostingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = JobPostingValidation;
