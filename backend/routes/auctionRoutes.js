// server/routes/auctionRoutes.js
import express from "express";
import Auction from "../models/Auction.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function uploadBufferToCloudinary(buffer, folder = "realtime-auctions") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Create auction
router.post("/", upload.single("imageFile"), async (req, res) => {
  try {
    const io = req.app.get("io");
    const { title, category, description, image, basePrice, durationMinutes } =
      req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const minutes = Math.max(1, Number(durationMinutes) || 10);
    const endAt = new Date(Date.now() + minutes * 60 * 1000);

    let imageUrl = image || "";

    if (req.file?.buffer) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (err) {
        console.warn("Cloudinary upload failed:", err);
      }
    }

    const newAuction = new Auction({
      title,
      category,
      description,
      image: imageUrl,
      basePrice: Number(basePrice) || 0,
      currentBid: Number(basePrice) || 0,
      endAt,
    });

    await newAuction.save();

    // emit globally
    io && io.emit("auction-created", newAuction);

    return res.status(201).json(newAuction);
  } catch (err) {
    console.error("Create auction error:", err);
    return res
      .status(500)
      .json({ message: "Error creating auction", error: err.message });
  }
});

// list
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching auctions" });
  }
});

// detail
router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.json(auction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching auction" });
  }
});

export default router;
