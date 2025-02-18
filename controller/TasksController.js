// controller/TasksController.js
const Task = require("../model/Tasks");
const Helper = require("../model/Helper"); // Ensure this exists
const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_your_secret_key_here"); // Replace with your Stripe secret key

const createTask = async (req, res) => {
    try {
        const {
            jobId,
            applicationId,
            helperDetails,
            scheduledDateTime,
            seekerEmail,
            helperEmail,
            posterEmail,
            location,
            jobSubCategory,
            jobCategory,
            jobTitle,
        } = req.body;
        console.log("Creating task with data:", req.body);

        const taskHelperDetails = {
            ...helperDetails,
            email: helperEmail,
            fullName: helperDetails?.fullName || "Unnamed Helper",
        };

        // Fetch helperId from Helper model if helperEmail is provided
        let helperId;
        if (helperEmail) {
            const helper = await Helper.findOne({ email: helperEmail });
            helperId = helper ? helper._id : null;
        }

        const newTask = new Task({
            jobId,
            applicationId,
            helperId, // Include helperId
            helperDetails: taskHelperDetails,
            scheduledDateTime,
            seekerEmail,
            helperEmail,
            posterEmail,
            location,
            jobSubCategory,
            jobCategory,
            jobTitle,
            status: "pending",
        });
        await newTask.save();
        console.log("Task saved:", newTask);
        res.status(201).json(newTask);
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ message: "Error creating task", error: err.message });
    }
};

const getHelperTasks = async (req, res) => {
    try {
        const { helperEmail } = req.params;
        console.log(`Fetching tasks for helper email: ${helperEmail}`);

        const tasks = await Task.find({ "helperDetails.email": { $regex: new RegExp(`^${helperEmail}$`, "i") } })
            .populate("jobId", "jobTitle category subCategory location salaryRange")
            .sort({ scheduledDateTime: -1 });

        console.log("Tasks fetched for helper:", JSON.stringify(tasks, null, 2));
        if (tasks.length === 0) {
            console.log(`No tasks found for helper email: ${helperEmail}`);
        }
        res.status(200).json(tasks);
    } catch (err) {
        console.error("Error fetching helper tasks:", err);
        res.status(500).json({ message: "Error fetching tasks", error: err.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, completionDateTime } = req.body;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID format" });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.status = status;
        if (completionDateTime) task.completionDateTime = completionDateTime;
        await task.save();
        console.log("Task status updated:", task);
        res.status(200).json(task);
    } catch (err) {
        console.error("Error updating task status:", err);
        res.status(500).json({ message: "Error updating task status", error: err.message });
    }
};

// controller/TasksController.js (partial update)
const getSeekerBookings = async (req, res) => {
    try {
        console.log(`Fetching bookings for seeker: ${req.user.email}`);

        const bookings = await Task.find({ seekerEmail: req.user.email })
            .populate({
                path: "jobId",
                select: "jobTitle jobDescription category subCategory location salaryRange contractType applicationDeadline",
            })
            .populate({
                path: "helperId",
                select: "fullName email",
            })
            .sort({ scheduledDateTime: -1 });

        const enrichedBookings = await Promise.all(
            bookings.map(async (booking) => {
                let helperDetails = booking.helperDetails || { fullName: "Unnamed Helper", email: "N/A" };

                // Use helperId if available
                if (booking.helperId) {
                    helperDetails = {
                        fullName: booking.helperId.fullName || "Unnamed Helper",
                        email: booking.helperId.email || "N/A",
                    };
                }
                // Fallback to helperEmail if helperId is missing
                else if (booking.helperEmail && (!helperDetails.fullName || helperDetails.fullName === "Unknown Helper")) {
                    const helper = await Helper.findOne({ email: booking.helperEmail });
                    if (helper) {
                        helperDetails = {
                            fullName: helper.fullName,
                            email: helper.email,
                        };
                    }
                }

                return {
                    ...booking.toObject(),
                    helperDetails,
                };
            })
        );

        console.log("Seeker bookings fetched:", JSON.stringify(enrichedBookings, null, 2));
        if (enrichedBookings.length === 0) {
            console.log("No bookings found for seeker:", req.user.email);
        }
        res.status(200).json(enrichedBookings);
    } catch (err) {
        console.error("Error fetching seeker bookings:", err);
        res.status(500).json({ message: "Error fetching bookings", error: err.message });
    }
};

const createCheckoutSession = async (req, res) => {
    const { jobId, salaryRange } = req.body;

    try {
        console.log("Creating checkout session for:", { jobId, salaryRange });

        const Job = require("../model/Job");
        const job = await Job.findById(jobId);
        if (!job) {
            console.log("Job not found for ID:", jobId);
            return res.status(404).json({ message: "Job not found" });
        }

        const amount = parseInt(salaryRange.split("-")[0].replace("$", "")) * 100;
        if (isNaN(amount) || amount <= 0) {
            console.log("Invalid salaryRange:", salaryRange);
            return res.status(400).json({ message: "Invalid salary range" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Payment for ${job.jobTitle}`,
                            description: `Task completed by helper`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/seeker/bookings?payment=success&taskId=${jobId}`,
            cancel_url: `http://localhost:5173/seeker/bookings?payment=cancel&taskId=${jobId}`,
        });

        console.log("Checkout session created:", session.id);
        res.json({ id: session.id });
    } catch (err) {
        console.error("Error creating checkout session:", err);
        res.status(500).json({ message: "Payment setup failed", error: err.message });
    }
};

module.exports = {
    createTask,
    getHelperTasks,
    updateTaskStatus,
    getSeekerBookings,
    createCheckoutSession,
};