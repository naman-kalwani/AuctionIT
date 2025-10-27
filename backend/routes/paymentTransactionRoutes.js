import express from "express";
import Payment from "../models/Payment.js";
import PaymentMethod from "../models/PaymentMethod.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's payments (pending and received)
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Payments user needs to make (won auctions)
    const pending = await Payment.find({
      buyer: userId,
      status: "pending",
    })
      .populate("auction", "title image endAt")
      .populate("seller", "username email")
      .populate("buyer", "username email")
      .sort({ createdAt: -1 });

    // Populate payment methods for pending payments
    const pendingWithMethods = await Promise.all(
      pending.map(async (payment) => {
        const paymentMethod = await PaymentMethod.findOne({
          user: payment.seller,
          isDefault: true,
        });
        return {
          ...payment.toObject(),
          paymentMethod: paymentMethod || null,
        };
      })
    );

    // Payments user will receive (sold auctions)
    const received = await Payment.find({
      seller: userId,
    })
      .populate("auction", "title image endAt")
      .populate("seller", "username email")
      .populate("buyer", "username email")
      .sort({ createdAt: -1 });

    res.json({
      pending: pendingWithMethods,
      received,
    });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark payment as paid
router.post("/:auctionId/mark-paid", verifyToken, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      auction: auctionId,
      buyer: userId,
      status: "pending",
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save();

    res.json({ message: "Payment marked as paid", payment });
  } catch (err) {
    console.error("Error marking payment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
