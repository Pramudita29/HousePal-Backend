const Joi = require("joi");

const jobApplicationSchema = Joi.object({
    jobId: Joi.string().hex().length(24).required(),
    helperDetails: Joi.object({
        fullName: Joi.string().required(),
        email: Joi.string().email().required(),
        contactNo: Joi.string().required(),
        skills: Joi.array().items(Joi.string()).required(),
        experience: Joi.string().required(),
        image: Joi.string().allow(null, '').optional() // Optional field
    }).required(),
    status: Joi.string().valid("pending", "accepted", "rejected").default("pending"),
});

function validateApplication(req, res, next) {
    const { error } = jobApplicationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = { validateApplication };