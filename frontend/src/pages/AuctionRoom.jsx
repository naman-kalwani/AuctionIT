import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import BidHistory from "../components/BidHistory";

export default function AuctionRoom({
  auction: initialAuction,
  currentUser,
  onBack,
}) {
  const [auction, setAuction] = useState(initialAuction);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [highlight, setHighlight] = useState(false);
  const timerRef = useRef(null);

  const isOwner = auction.owner?.username
    ? auction.owner.username === currentUser?.username
    : auction.owner === currentUser?.id;
  const canBid = !auction.ended && !isOwner;
  const showBidHistory = isOwner && auction.bidHistory?.length > 0;

  // SOCKET EVENTS
  useEffect(() => {
    if (!initialAuction?._id) return;
    setAuction(initialAuction);
    socket.emit("join-auction", initialAuction._id);

    const onBidUpdated = (data) => {
      if (data.auctionId === initialAuction._id) {
        setAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory || prev.bidHistory,
        }));
        setHighlight(true);
        setTimeout(() => setHighlight(false), 600);
        new Audio("/ding.mp3").play().catch(() => {});
      }
    };

    const onAuctionEnded = (data) => {
      if (data.auctionId === initialAuction._id) {
        setAuction((prev) => ({ ...prev, ended: true }));
        setMessage(
          `🏁 Auction ended — Winner: ${data.winner}, Final Bid: ₹${data.finalBid}`
        );
      }
    };

    socket.on("bid-updated", onBidUpdated);
    socket.on("auction-ended", onAuctionEnded);

    return () => {
      socket.emit("leave-auction", initialAuction._id);
      socket.off("bid-updated", onBidUpdated);
      socket.off("auction-ended", onAuctionEnded);
    };
  }, [initialAuction]);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (!auction) return;
    const updateTimer = () => {
      const diff = new Date(auction.endAt) - new Date();
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        setAuction((prev) => ({ ...prev, ended: true }));
        clearInterval(timerRef.current);
      } else {
        const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setTimeLeft(`${h}:${m}:${s}`);
      }
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [auction]);

  const placeBid = () => {
    const amount = Number(bidAmount);
    if (!amount || amount <= (auction.currentBid ?? auction.basePrice ?? 0)) {
      setMessage("❌ Bid must be higher than current bid");
      return;
    }
    socket.emit("place-bid", { auctionId: auction._id, amount });
    setBidAmount("");
    setMessage("");
  };

  return (
    <div
      className={`max-w-6xl mx-auto mt-6 ${
        showBidHistory
          ? "grid md:grid-cols-[2fr_1fr] gap-6"
          : "flex justify-center"
      } animate-fadeIn`}
    >
      {/* LEFT PANEL — AUCTION DETAILS */}
      <div
        className={`p-6 bg-white rounded-2xl shadow-lg w-full ${
          showBidHistory ? "" : "max-w-3xl"
        }`}
      >
        <button
          onClick={onBack}
          className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-medium"
        >
          ← Back
        </button>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{auction.title}</h2>
          {!auction.ended && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              LIVE 🔴
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-1">Category: {auction.category}</p>
        <p className="text-gray-600 mb-4">{auction.description}</p>

        {auction.image && (
          <div className="rounded-xl overflow-hidden mb-4 border bg-gray-50 flex justify-center">
            <img
              src={auction.image}
              alt="Auction"
              className="object-contain max-h-80 w-full"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Base Price</p>
            <p className="text-xl font-bold">₹{auction.basePrice}</p>
            <p className="text-sm text-gray-500 mt-2">
              {auction.ended ? "Final Bid" : "Current Bid"}
            </p>
            <p
              className={`text-2xl font-bold transition-transform ${
                highlight ? "text-green-600 scale-110" : ""
              }`}
            >
              ₹{auction.currentBid}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Highest Bidder</p>
            <p className="text-lg font-semibold">
              {auction.highestBidderName || "No bids yet"}
            </p>
            <p className="text-sm text-blue-600 mt-2">Ends in:</p>
            <p className="text-2xl font-bold">{timeLeft}</p>
          </div>
        </div>

        {message && (
          <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded">
            {message}
          </div>
        )}

        {canBid && (
          <div className="flex gap-2">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your bid"
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              onClick={placeBid}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Place Bid
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL — BID HISTORY */}
      {showBidHistory && (
        <div className="p-6 bg-white rounded-2xl shadow-lg h-fit md:sticky md:top-6">
          <BidHistory
            bids={auction.bidHistory}
            title="Bid History"
            currentBid={auction.currentBid}
            basePrice={auction.basePrice}
            ended={auction.ended}
          />
        </div>
      )}
    </div>
  );
}
