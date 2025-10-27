import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "AUCTION_RESULT",
        "AUCTION_WINNER",
        "BID_PLACED",
        "OUTBID",
        "AUCTION_ENDING_SOON",
        "NEW_BID_SUCCESS",
      ],
      required: true,
    },
    message: { type: String, required: true },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
