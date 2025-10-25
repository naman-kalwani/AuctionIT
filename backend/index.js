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

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || "*" },
  pingTimeout: 20000,
  transports: ["polling", "websocket"],
});

// ✅ Attach io to app for routes
app.set("io", io);

// ✅ Connect MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Mongo Error:", err);
    process.exit(1);
  }
})();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.get("/", (req, res) => res.send("Auction backend running..."));

// ✅ SOCKET.IO AUTH MIDDLEWARE (reads token and attaches user to socket)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, username, email }
  } catch {
    socket.user = null;
  }
  next();
});

// ✅ SOCKET EVENTS
io.on("connection", (socket) => {
  console.log(
    "🔌 Client connected:",
    socket.id,
    "| User:",
    socket.user?.username ?? "Guest"
  );

  socket.on("join-auction", (auctionId) => {
    if (!auctionId) return;
    socket.join(String(auctionId));
    socket.emit("joined-auction", {
      auctionId,
      message: "Joined successfully",
    });
  });

  socket.on("leave-auction", (auctionId) => {
    if (!auctionId) return;
    socket.leave(String(auctionId));
  });

  // ✅ UPDATED place-bid (username auto from socket.user)
  socket.on("place-bid", async ({ auctionId, amount }) => {
    try {
      const bidderName = socket.user?.username || "Anonymous";
      const Auction = mongoose.model("Auction");

      const parsedAmount = Number(amount);
      if (!auctionId || !Number.isFinite(parsedAmount) || parsedAmount <= 0)
        return socket.emit("error", "Invalid bid data");

      const auction = await Auction.findById(auctionId);
      if (!auction) return socket.emit("error", "Auction not found");

      const now = new Date();
      if (auction.ended || now > new Date(auction.endAt)) {
        auction.ended = true;
        await auction.save();
        io.emit("auction-ended", {
          auctionId: auction._id,
          winner: auction.highestBidder,
          finalBid: auction.currentBid,
        });
        return;
      }

      const current = auction.currentBid ?? auction.basePrice;
      if (parsedAmount <= current) return socket.emit("error", "Bid too low");

      const previousHighest = auction.highestBidder || null;

      auction.currentBid = parsedAmount;
      auction.highestBidder = bidderName;
      auction.bids.push({ bidderName, amount: parsedAmount, at: now });
      await auction.save();

      io.emit("bid-updated", {
        auctionId,
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder,
      });

      io.to(String(auctionId)).emit("outbid", {
        previousBidder,
        newBid: parsedAmount,
        auctionId,
      });

      console.log(`💸 ${bidderName} → ₹${parsedAmount} on ${auctionId}`);
    } catch (err) {
      console.error("place-bid error:", err);
      socket.emit("error", "Server error");
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ AUTO END AUCTIONS
setInterval(async () => {
  try {
    const Auction = mongoose.model("Auction");
    const now = new Date();
    const toEnd = await Auction.find({ ended: false, endAt: { $lte: now } });

    for (const auction of toEnd) {
      auction.ended = true;
      await auction.save();

      io.emit("auction-ended", {
        auctionId: auction._id,
        winner: auction.highestBidder,
        finalBid: auction.currentBid,
      });

      console.log(
        `🏁 Auction ended: ${auction._id} Winner: ${auction.highestBidder}`
      );
    }
  } catch (err) {
    console.error("Auto-end error:", err);
  }
}, 3000);

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// // server/index.js
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import auctionRoutes from "./routes/auctionRoutes.js";
// import helmet from "helmet";

// dotenv.config();
// const app = express();
// app.use(helmet());
// app.use(cors());
// app.use(express.json({ limit: "5mb" }));

// const httpServer = createServer(app);
// export const io = new Server(httpServer, {
//   cors: { origin: process.env.CORS_ORIGIN || "*" },
//   pingTimeout: 20000,
//   transports: ["polling", "websocket"],
// });

// // attach io to app so routes can access it without circular imports
// app.set("io", io);

// // connect mongoose
// (async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ MongoDB Connected");
//   } catch (err) {
//     console.error("❌ Mongo Error:", err);
//     process.exit(1);
//   }
// })();

// app.use("/api/auctions", auctionRoutes);
// app.get("/", (req, res) => res.send("Auction backend running..."));

// // Socket.io logic
// io.on("connection", (socket) => {
//   console.log("🔌 Client connected:", socket.id);

//   socket.on("join-auction", (auctionId) => {
//     if (!auctionId) return;
//     socket.join(String(auctionId));
//     console.log(`✅ ${socket.id} joined room ${auctionId}`);
//     socket.emit("joined-auction", {
//       auctionId,
//       message: "Joined successfully",
//     });
//   });

//   socket.on("leave-auction", (auctionId) => {
//     if (!auctionId) return;
//     socket.leave(String(auctionId));
//     console.log(`↩️ ${socket.id} left room ${auctionId}`);
//   });

//   socket.on("place-bid", async ({ auctionId, bidderName, amount }) => {
//     try {
//       const Auction = mongoose.model("Auction");
//       if (!auctionId) return socket.emit("error", "Invalid auctionId");
//       const parsedAmount = Number(amount);
//       if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
//         return socket.emit("error", "Invalid bid amount");

//       const auction = await Auction.findById(auctionId);
//       if (!auction) return socket.emit("error", "Auction not found");

//       const now = new Date();
//       if (auction.ended || now > new Date(auction.endAt)) {
//         auction.ended = true;
//         await auction.save();

//         io.emit("auction-ended", {
//           auctionId: auction._id,
//           winner: auction.highestBidder,
//           finalBid: auction.currentBid,
//         });
//         return socket.emit("error", "Auction has ended");
//       }

//       const current = auction.currentBid ?? auction.basePrice;
//       if (parsedAmount <= current) {
//         return socket.emit("error", "Bid too low");
//       }

//       const previousHighest = auction.highestBidder || null;

//       // Update auction
//       auction.currentBid = parsedAmount;
//       auction.highestBidder = bidderName || "Anonymous";
//       auction.bids.push({
//         bidderName: bidderName || "Anonymous",
//         amount: parsedAmount,
//         at: now,
//       });
//       await auction.save();

//       // Broadcast updates
//       io.emit("bid-updated", {
//         auctionId,
//         currentBid: auction.currentBid,
//         highestBidder: auction.highestBidder,
//       });

//       io.to(String(auctionId)).emit("outbid", {
//         previousBidder: previousHighest,
//         newBid: parsedAmount,
//         auctionId,
//       });

//       console.log(
//         `💸 New bid on ${auctionId}: ₹${parsedAmount} by ${bidderName}`
//       );
//     } catch (err) {
//       console.error("place-bid error:", err);
//       socket.emit("error", "Server error");
//     }
//   });

//   socket.on("disconnect", (reason) => {
//     console.log("❌ Client disconnected:", socket.id, reason);
//   });
// });

// // Auto-end auctions periodically (every 3 seconds)
// setInterval(async () => {
//   try {
//     const Auction = mongoose.model("Auction");
//     const now = new Date();
//     const toEnd = await Auction.find({ ended: false, endAt: { $lte: now } });

//     for (const auction of toEnd) {
//       auction.ended = true;
//       await auction.save();

//       io.emit("auction-ended", {
//         auctionId: auction._id,
//         winner: auction.highestBidder,
//         finalBid: auction.currentBid,
//       });

//       console.log(
//         `🏁 Auction ended: ${auction._id} Winner: ${auction.highestBidder}`
//       );
//     }
//   } catch (err) {
//     console.error("Auto-end error:", err);
//   }
// }, 3000);

// const PORT = process.env.PORT || 4000;
// httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
