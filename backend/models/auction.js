import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    description: String,
    image: String,
    basePrice: Number,
    currentBid: { type: Number, default: 0 },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    highestBidderName: { type: String, default: "" }, // store name directly
    bidHistory: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bidderName: { type: String, default: "" }, // store bidder name
        amount: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    endAt: Date,
    ended: { type: Boolean, default: false },
    warningNotificationSent: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, default: "" }, // store owner name
  },
  { timestamps: true }
);

export default mongoose.model("Auction", auctionSchema);
