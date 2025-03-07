const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const seekerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (email) => /\S+@\S+\.\S+/.test(email),
            message: "Invalid email format.",
        },
    },
    contactNo: {
        type: String,
        required: true,
        validate: {
            validator: (number) => /^\d{10}$/.test(number),
            message: "Contact number must be 10 digits.",
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Enforcing a minimum length for security
    },
    image: {
        type: String, // Path or URL of the uploaded image
        default: "",
    },
    notifications: [
        {
            message: String,
            isRead: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });

seekerSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Seeker = mongoose.models.Seeker || mongoose.model("Seeker", seekerSchema);
module.exports = Seeker;