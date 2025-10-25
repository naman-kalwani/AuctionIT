import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    description: String,
    image: String,
    basePrice: Number,
    currentBid: Number,
    highestBidder: String,
    bids: [
      {
        bidderName: String,
        amount: Number,
        at: { type: Date, default: Date.now },
      },
    ],
    endAt: Date,
    ended: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // NEW
  },
  { timestamps: true }
);

export default mongoose.model("Auction", auctionSchema);



// // server/models/Auction.js
// import mongoose from "mongoose";

// const BidSchema = new mongoose.Schema(
//   {
//     bidderName: { type: String, default: "Anonymous" },
//     amount: { type: Number, required: true },
//     at: { type: Date, default: Date.now },
//   },
//   { _id: false }
// );

// const AuctionSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     category: { type: String, default: "other" },
//     description: { type: String, default: "" },
//     image: { type: String, default: "" },
//     basePrice: { type: Number, default: 0 },
//     currentBid: { type: Number, default: 0 },
//     highestBidder: { type: String, default: "" },
//     bids: { type: [BidSchema], default: [] },
//     endAt: { type: Date, required: true },
//     ended: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Auction || mongoose.model("Auction", AuctionSchema);
