const Joi = require("joi");

const bookingSchema = Joi.object({
    seekerId: Joi.string().required(), // Validate as ObjectId
    HelperId: Joi.string().required(),
    jobId: Joi.string().required(),
    date: Joi.date().required(),
    time: Joi.string().required(), // Validate time format if needed
    status: Joi.string().valid("requested", "confirmed", "completed", "cancelled").default("requested"),
});

function BookingValidation(req, res, next) {
    const { error } = bookingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation Error", error: error.details });
    }
    next();
}

module.exports = BookingValidation;
