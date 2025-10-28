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
        _id: n._id,
        message: n.message,
        type: n.type,
        read: n.isRead,
        createdAt: n.createdAt,
        timestamp: n.createdAt,
      }))
    );
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT mark single notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT mark all notifications as read
router.put("/mark-all-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
