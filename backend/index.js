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

app.set("io", io);

// MongoDB Connection
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.get("/", (req, res) => res.send("Auction backend running..."));

// SOCKET.IO AUTH
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

// SOCKET EVENTS
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

  socket.on("place-bid", async ({ auctionId, amount }) => {
    try {
      const Auction = mongoose.model("Auction");
      const parsedAmount = Number(amount);
      const userId = socket.user?.id;

      if (!auctionId || !Number.isFinite(parsedAmount) || parsedAmount <= 0)
        return socket.emit("error", "Invalid bid data");
      if (!userId) return socket.emit("error", "Unauthorized");

      const auction = await Auction.findById(auctionId).populate(
        "highestBidder",
        "username"
      );
      if (!auction) return socket.emit("error", "Auction not found");

      const now = new Date();
      if (auction.ended || now > auction.endAt) {
        auction.ended = true;
        await auction.save();
        io.emit("auction-ended", {
          auctionId: auction._id,
          winner: auction.highestBidder?.username || "No winner",
          finalBid: auction.currentBid,
        });
        return;
      }

      const current = auction.currentBid ?? auction.basePrice;
      if (parsedAmount <= current) return socket.emit("error", "Bid too low");

      const previousHighest = auction.highestBidder || null;

      auction.currentBid = parsedAmount;
      auction.highestBidder = userId;
      auction.bidHistory.push({ userId, amount: parsedAmount, timestamp: now });
      await auction.save();

      // Populate highest bidder name
      const updatedAuction = await Auction.findById(auctionId).populate(
        "highestBidder",
        "username"
      );

      io.emit("bid-updated", {
        auctionId,
        currentBid: updatedAuction.currentBid,
        highestBidder: updatedAuction.highestBidder?.username || null,
      });

      io.to(String(auctionId)).emit("outbid", {
        previousBidder: previousHighest?.toString() || null,
        newBid: parsedAmount,
        auctionId,
      });

      console.log(
        `💸 ${socket.user.username} → ₹${parsedAmount} on ${auctionId}`
      );
    } catch (err) {
      console.error("place-bid error:", err);
      socket.emit("error", "Server error");
    }
  });

  socket.on("disconnect", () =>
    console.log("❌ Client disconnected:", socket.id)
  );
});

// AUTO-END AUCTIONS
setInterval(async () => {
  try {
    const Auction = mongoose.model("Auction");
    const now = new Date();
    const toEnd = await Auction.find({
      ended: false,
      endAt: { $lte: now },
    }).populate("highestBidder", "username");

    for (const auction of toEnd) {
      auction.ended = true;
      await auction.save();

      io.emit("auction-ended", {
        auctionId: auction._id,
        winner: auction.highestBidder?.username || "No winner",
        finalBid: auction.currentBid,
      });

      console.log(
        `🏁 Auction ended: ${auction._id} Winner: ${auction.highestBidder?.username}`
      );
    }
  } catch (err) {
    console.error("Auto-end error:", err);
  }
}, 3000);

// START SERVER
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// // server/index.js
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import helmet from "helmet";
// import jwt from "jsonwebtoken";

// import auctionRoutes from "./routes/auctionRoutes.js";
// import authRoutes from "./routes/authRoutes.js";

// dotenv.config();
// const app = express();
// app.use(helmet());
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "5mb" }));

// const httpServer = createServer(app);
// export const io = new Server(httpServer, {
//   cors: { origin: process.env.CORS_ORIGIN || "*" },
//   pingTimeout: 20000,
//   transports: ["polling", "websocket"],
// });

// // ✅ Attach io to app for routes
// app.set("io", io);

// // ✅ Connect MongoDB
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

// // ✅ API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/auctions", auctionRoutes);
// app.get("/", (req, res) => res.send("Auction backend running..."));

// // ✅ SOCKET.IO AUTH MIDDLEWARE (reads token and attaches user to socket)
// io.use((socket, next) => {
//   const token = socket.handshake.auth?.token;
//   if (!token) {
//     socket.user = null;
//     return next();
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = decoded; // { id, username, email }
//   } catch {
//     socket.user = null;
//   }
//   next();
// });

// // ✅ SOCKET EVENTS
// io.on("connection", (socket) => {
//   console.log(
//     "🔌 Client connected:",
//     socket.id,
//     "| User:",
//     socket.user?.username ?? "Guest"
//   );

//   socket.on("join-auction", (auctionId) => {
//     if (!auctionId) return;
//     socket.join(String(auctionId));
//     socket.emit("joined-auction", {
//       auctionId,
//       message: "Joined successfully",
//     });
//   });

//   socket.on("leave-auction", (auctionId) => {
//     if (!auctionId) return;
//     socket.leave(String(auctionId));
//   });

//   // ✅ UPDATED place-bid (username auto from socket.user)
//   socket.on("place-bid", async ({ auctionId, amount }) => {
//     try {
//       const bidderName = socket.user?.username || "Anonymous";
//       const Auction = mongoose.model("Auction");

//       const parsedAmount = Number(amount);
//       if (!auctionId || !Number.isFinite(parsedAmount) || parsedAmount <= 0)
//         return socket.emit("error", "Invalid bid data");

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
//         return;
//       }

//       const current = auction.currentBid ?? auction.basePrice;
//       if (parsedAmount <= current) return socket.emit("error", "Bid too low");

//       const previousHighest = auction.highestBidder || null;

//       auction.currentBid = parsedAmount;
//       auction.highestBidder = bidderName;
//       auction.bids.push({ bidderName, amount: parsedAmount, at: now });
//       await auction.save();

//       io.emit("bid-updated", {
//         auctionId,
//         currentBid: auction.currentBid,
//         highestBidder: auction.highestBidder,
//       });

//       io.to(String(auctionId)).emit("outbid", {
//         previousBidder,
//         newBid: parsedAmount,
//         auctionId,
//       });

//       console.log(`💸 ${bidderName} → ₹${parsedAmount} on ${auctionId}`);
//     } catch (err) {
//       console.error("place-bid error:", err);
//       socket.emit("error", "Server error");
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// // ✅ AUTO END AUCTIONS
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

// // ✅ START SERVER
// const PORT = process.env.PORT || 5000;
// httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
