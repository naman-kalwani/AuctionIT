// server/routes/notificationRoutes.js
import express from "express";
import Notification from "../models/notification.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET notifications for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // limit for safety

    res.json(
      notifications.map((n) => ({
        message: n.message,
        type: n.type,
        time: n.createdAt.toLocaleString(),
      }))
    );
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
