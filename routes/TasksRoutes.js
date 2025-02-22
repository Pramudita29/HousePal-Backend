const express = require("express");
const router = express.Router();
const { createTask, getHelperTasks, updateTaskStatus, getSeekerBookings, createCheckoutSession } = require("../controller/TasksController");
const { authenticateToken } = require("../security/auth");

router.post("/create", authenticateToken, createTask);
router.get("/helper/:helperEmail", authenticateToken, getHelperTasks);
router.put("/:taskId/status", authenticateToken, updateTaskStatus);
router.get("/seeker", authenticateToken, getSeekerBookings);
router.post("/create-checkout-session", authenticateToken, createCheckoutSession);

module.exports = router;