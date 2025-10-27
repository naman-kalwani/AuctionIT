import express from "express";
import PaymentMethod from "../models/PaymentMethod.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all payment methods for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json(methods);
  } catch (err) {
    console.error("Get payment methods error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add new payment method
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      type,
      upiId,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
    } = req.body;

    // Validate required fields
    if (type === "UPI" && !upiId) {
      return res.status(400).json({ error: "UPI ID is required" });
    }
    if (
      type === "Bank Account" &&
      (!bankName || !accountNumber || !ifscCode || !accountHolderName)
    ) {
      return res.status(400).json({ error: "All bank details are required" });
    }

    // Check if this is the first payment method
    const existingCount = await PaymentMethod.countDocuments({
      user: req.user.id,
    });

    const newMethod = new PaymentMethod({
      user: req.user.id,
      type,
      upiId: type === "UPI" ? upiId : undefined,
      bankName: type === "Bank Account" ? bankName : undefined,
      accountNumber: type === "Bank Account" ? accountNumber : undefined,
      ifscCode: type === "Bank Account" ? ifscCode : undefined,
      accountHolderName:
        type === "Bank Account" ? accountHolderName : undefined,
      isDefault: existingCount === 0, // Set as default if it's the first one
    });

    await newMethod.save();
    res.status(201).json(newMethod);
  } catch (err) {
    console.error("Add payment method error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Set payment method as default
router.patch("/:id/set-default", verifyToken, async (req, res) => {
  try {
    // Remove default from all user's methods
    await PaymentMethod.updateMany({ user: req.user.id }, { isDefault: false });

    // Set this method as default
    const method = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!method) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    res.json(method);
  } catch (err) {
    console.error("Set default error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete payment method
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const method = await PaymentMethod.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!method) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    // If deleted method was default, set another as default
    if (method.isDefault) {
      const firstMethod = await PaymentMethod.findOne({ user: req.user.id });
      if (firstMethod) {
        firstMethod.isDefault = true;
        await firstMethod.save();
      }
    }

    res.json({ message: "Payment method deleted successfully" });
  } catch (err) {
    console.error("Delete payment method error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
