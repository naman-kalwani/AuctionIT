// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import jwt from "jsonwebtoken";

import auctionRoutes from "./routes/auctionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import Auction from "./models/auction.js";
import Notification from "./models/notification.js";

dotenv.config();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// HTTP + Socket.io server
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || "*" },
  pingTimeout: 20000,
});

// Track online users
const onlineUsers = new Map();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => res.send("Auction backend running..."));

// Connect to MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
})();

// ------------------- SOCKET.IO -------------------

// WebSocket auth
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.user = token ? jwt.verify(token, process.env.JWT_SECRET) : null;
  } catch {
    socket.user = null;
  }
  next();
});

// Socket events
io.on("connection", (socket) => {
  const userId = socket.user?.id;
  if (userId) onlineUsers.set(userId, socket.id);

  // Join / Leave Auction Room
  socket.on("join-auction", (auctionId) => {
    if (auctionId) socket.join(auctionId);
  });

  socket.on("leave-auction", (auctionId) => {
    if (auctionId) socket.leave(auctionId);
  });

  // Place Bid
  socket.on("place-bid", async ({ auctionId, amount }) => {
    if (!userId) return;

    try {
      const auction = await Auction.findById(auctionId).populate(
        "owner highestBidder",
        "username"
      );
      if (!auction) return;

      if (auction.ended)
        return socket.emit("bid-error", { message: "Auction has ended" });
      if (amount <= (auction.currentBid ?? auction.basePrice ?? 0))
        return socket.emit("bid-error", {
          message: "Bid must be higher than current",
        });
      if (auction.owner._id.toString() === userId)
        return socket.emit("bid-error", {
          message: "Owner cannot bid on own auction",
        });

      // Update auction
      auction.currentBid = amount;
      auction.highestBidder = userId;
      auction.bidHistory.push({
        userId,
        bidderName: socket.user.username,
        amount,
        timestamp: new Date(),
      });
      await auction.save();

      // Emit update to auction room
      io.emit("bid-updated", {
        auctionId: auction._id,
        currentBid: auction.currentBid,
        highestBidderName: socket.user.username,
        bidHistory: auction.bidHistory,
      });
    } catch (err) {
      console.error("Bid error:", err);
      socket.emit("bid-error", { message: "Error placing bid" });
    }
  });

  socket.on("disconnect", () => {
    if (userId) onlineUsers.delete(userId);
  });
});

// ------------------- AUTO-END AUCTIONS -------------------
setInterval(async () => {
  try {
    const now = new Date();
    const endingAuctions = await Auction.find({
      ended: false,
      endAt: { $lte: now },
    }).populate("owner highestBidder", "username");

    for (const auction of endingAuctions) {
      try {
        auction.ended = true;
        await auction.save();

        const ownerId = auction.owner?._id?.toString();
        const winnerId = auction.highestBidder?._id?.toString();

        io.to(auction._id.toString()).emit("auction-ended", {
          auctionId: auction._id,
          winner: auction.highestBidder?.username || "No winner",
          finalBid: auction.currentBid,
        });

        // Winner notification
        if (winnerId) {
          const winnerNotification = await Notification.create({
            user: winnerId,
            auction: auction._id,
            type: "AUCTION_WINNER",
            message: `🎉 You won "${auction.title}" for ₹${auction.currentBid}!`,
          });
          if (onlineUsers.has(winnerId)) {
            io.to(onlineUsers.get(winnerId)).emit("notification", {
              message: winnerNotification.message,
            });
          }
        }

        // Owner notification
        if (ownerId) {
          const ownerNotification = await Notification.create({
            user: ownerId,
            auction: auction._id,
            type: "AUCTION_RESULT",
            message: `🏁 Your auction "${auction.title}" ended. Winner: ${
              auction.highestBidder?.username || "No one"
            }`,
          });
          if (onlineUsers.has(ownerId)) {
            io.to(onlineUsers.get(ownerId)).emit("notification", {
              message: ownerNotification.message,
            });
          }
        }
      } catch (auctionErr) {
        console.error("Error processing auction:", auction._id, auctionErr);
      }
    }
  } catch (err) {
    console.error("Error ending auctions:", err);
  }
}, 3000);

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
