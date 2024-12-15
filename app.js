const express = require("express");
const connectDB = require("./config/db"); // Adjust the path as needed
const SeekerRoute = require("./routes/SeekerRoute");
const HelperRoute = require("./routes/HelperRoute");
const JobPostingRoute = require("./routes/jobPostingRoutes");
const BookingRoute = require("./routes/BookingRoutes");
const FeedbackRoute = require("./routes/FeedbackRoute");
const AuthRouter = require("./routes/AuthRoute");

const app = express();

// Connect to MongoDB
connectDB();


app.use(express.json());

app.use("/api/seeker",SeekerRoute);
app.use("/api/helper", HelperRoute);
app.use("/api/jobPosting", JobPostingRoute);
app.use("/api/Booking", BookingRoute);
app.use("/api/FeedbackRoute",FeedbackRoute)

app.use("/api/auth",AuthRouter)



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
