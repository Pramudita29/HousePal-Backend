const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipientEmail: {
        type: String,
        required: true,
    },
    recipientType: {
        type: String,
        enum: ['Helper', 'Seeker'], // Define possible types
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    jobId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);