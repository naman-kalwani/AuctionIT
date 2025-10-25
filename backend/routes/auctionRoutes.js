import express from "express";
import Auction from "../models/Auction.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import { io } from "../index.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // ✅ NEW

dotenv.config();
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

function uploadBufferToCloudinary(buffer, folder = "realtime-auctions") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ✅ Protected Create Auction
router.post("/", verifyToken, upload.single("imageFile"), async (req, res) => {
  try {
    const { title, category, description, basePrice, durationMinutes } =
      req.body;
    const endAt = new Date(
      Date.now() + (Number(durationMinutes) || 10) * 60 * 1000
    );

    let imageUrl = "";
    if (req.file?.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newAuction = new Auction({
      title,
      category,
      description,
      image: imageUrl,
      basePrice: Number(basePrice) || 0,
      currentBid: Number(basePrice) || 0,
      endAt,
      owner: req.user.id, // ✅ store creator ID
    });

    await newAuction.save();
    io.emit("auction-created", newAuction);
    res.status(201).json(newAuction);
  } catch (err) {
    console.error("Create auction error:", err);
    res.status(500).json({ message: "Error creating auction" });
  }
});

router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("owner", "username email")
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching auctions" });
  }
});

export default router;

// // server/routes/auctionRoutes.js
// import express from "express";
// import Auction from "../models/Auction.js";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";
// import dotenv from "dotenv";
// import { io } from "../index.js";

// dotenv.config();
// const router = express.Router();

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer for file uploads (memory)
// const upload = multer({ storage: multer.memoryStorage() });

// function uploadBufferToCloudinary(buffer, folder = "realtime-auctions") {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder },
//       (err, res) => {
//         if (err) return reject(err);
//         resolve(res);
//       }
//     );
//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// }

// // Create auction
// router.post("/", upload.single("imageFile"), async (req, res) => {
//   try {
//     const { title, category, description, image, basePrice, durationMinutes } =
//       req.body;
//     const endAt = new Date(
//       Date.now() + (Number(durationMinutes) || 10) * 60 * 1000
//     );
//     let imageUrl = image || "";

//     if (req.file?.buffer) {
//       const result = await uploadBufferToCloudinary(req.file.buffer);
//       imageUrl = result.secure_url;
//     }

//     const newAuction = new Auction({
//       title,
//       category,
//       description,
//       image: imageUrl,
//       basePrice: Number(basePrice) || 0,
//       currentBid: Number(basePrice) || 0,
//       endAt,
//     });

//     await newAuction.save();

//     // Emit new auction to all clients
//     io.emit("auction-created", newAuction);

//     return res.status(201).json(newAuction);
//   } catch (err) {
//     console.error("Create auction error:", err);
//     return res
//       .status(500)
//       .json({ message: "Error creating auction", error: err.message });
//   }
// });

// // Get all auctions
// router.get("/", async (req, res) => {
//   try {
//     const auctions = await Auction.find().sort({ createdAt: -1 });
//     res.json(auctions);
//   } catch (err) {
//     console.error("fetch auctions error:", err);
//     res.status(500).json({ message: "Error fetching auctions" });
//   }
// });

// // Get single auction
// router.get("/:id", async (req, res) => {
//   try {
//     const auction = await Auction.findById(req.params.id);
//     if (!auction) return res.status(404).json({ message: "Auction not found" });
//     res.json(auction);
//   } catch (err) {
//     console.error("fetch auction error:", err);
//     res.status(500).json({ message: "Error fetching auction" });
//   }
// });

// export default router;
