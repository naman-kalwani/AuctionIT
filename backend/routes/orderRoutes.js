import express from "express";
import Payment from "../models/Payment.js";
import PaymentMethod from "../models/PaymentMethod.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's orders (paid payments only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all paid orders for the user (as buyer)
    const orders = await Payment.find({
      buyer: userId,
      status: "paid",
    })
      .populate("auction", "title image endAt")
      .populate("seller", "username email")
      .populate("buyer", "username email")
      .sort({ paidAt: -1 }); // Most recent first

    // Populate payment methods for orders
    const ordersWithMethods = await Promise.all(
      orders.map(async (order) => {
        const paymentMethod = await PaymentMethod.findOne({
          user: order.seller,
          isDefault: true,
        });
        return {
          ...order.toObject(),
          paymentMethod: paymentMethod || null,
        };
      })
    );

    res.json(ordersWithMethods);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
