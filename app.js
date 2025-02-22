const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const SeekerRoute = require("./routes/SeekerRoute");
const HelperRoute = require("./routes/HelperRoute");
const JobRoute = require("./routes/JobRoute");
const ReviewRoutes = require("./routes/ReviewRoutes");
const AuthRouter = require("./routes/AuthRoute");
const JobApplicationRoutes = require("./routes/JobApplicationRoutes");
const NotificationRoutes = require("./routes/NotificationRoute");
const TasksRoutes = require("./routes/TasksRoutes");
const stripe = require("stripe")("sk_test_51QwnhfLwN9qJ226iTwZmSMJL1bmpD3rgOZOQ9QBKq6mk68iVPRg95LtPIn9TgE9MlEFq8WOUg2o0RNXCRYdBzqRF00CIlUlPcz");

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

connectDB();

app.use(express.json());
app.use("/api/images", express.static(path.join(__dirname, "images")));

app.use("/api/seeker", SeekerRoute);
app.use("/api/helper", HelperRoute);
app.use("/api/jobs", JobRoute);
app.use("/api/review", ReviewRoutes);
app.use("/api/auth", AuthRouter);
app.use("/api/job-applications", JobApplicationRoutes);
app.use("/api/tasks", TasksRoutes);
app.use("/api/notifications", NotificationRoutes);

app.post("/api/create-checkout-session", async (req, res) => {
  const { jobId, salaryRange } = req.body;

  try {
    console.log("Creating checkout session for:", { jobId, salaryRange });

    const Job = require("./model/Job");
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    const currencyPrefix = salaryRange.includes("$") ? "$" : "NPR";
    const amountStr = salaryRange.split("-")[0].replace(currencyPrefix, "").replace("/hr", "").trim();
    const amount = parseInt(amountStr) * 100;
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
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Export the app without starting the server
module.exports = app;

// Start the server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}