const Joi = require("joi");

const jobSchema = Joi.object({
    jobTitle: Joi.string().required(),
    jobDetails: Joi.string().required(),
    category: Joi.string().required(),
    subCategory: Joi.string().required(), // Add this line to ensure `subCategory` is required
    location: Joi.string().required(),
    salaryRange: Joi.string().required(),
    contractType: Joi.string().required(),
    applicationDeadline: Joi.date().required(),
    contactInfo: Joi.string().required(),
    status: Joi.string().valid("open", "booked", "completed", "cancelled").default("open"),
});

function JobValidation(req, res, next) {
    const { error } = jobSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = JobValidation;
