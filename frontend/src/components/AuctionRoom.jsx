import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";

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

  // Socket listeners
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
        setTimeout(() => setHighlight(false), 800);
        new Audio("/ding.mp3").play().catch(() => {});
      }
    };

    const onAuctionEnded = (data) => {
      if (data.auctionId === initialAuction._id) {
        setAuction((prev) => ({ ...prev, ended: true }));
        setMessage(
          `Auction ended. Winner: ${data.winner}, Final Bid: ₹${data.finalBid}`
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

  // Countdown timer in HH:MM:SS
  useEffect(() => {
    if (!auction) return;

    const updateTimer = () => {
      const diff = new Date(auction.endAt) - new Date();
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        setAuction((prev) => ({ ...prev, ended: true }));
        clearInterval(timerRef.current);
      } else {
        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(
          2,
          "0"
        );
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(
          2,
          "0"
        );
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-6 animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-medium"
      >
        ← Back
      </button>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold">{auction.title}</h2>
        {!auction.ended && (
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            LIVE 🔴
          </span>
        )}
      </div>

      <p className="text-gray-600 mb-1">Category: {auction.category}</p>
      <p className="text-gray-600 mb-2">{auction.description}</p>

      {auction.image && (
        <img
          src={auction.image}
          alt="Auction"
          className="my-4 w-full max-h-60 object-cover rounded-lg shadow-sm"
        />
      )}

      <p className="text-lg mb-1">Base Price: ₹{auction.basePrice}</p>

      <p
        className={`text-2xl font-bold mb-1 transition-transform ${
          highlight ? "text-green-600 scale-110" : "text-black scale-100"
        }`}
      >
        Current Bid: ₹{auction.currentBid}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Highest Bidder: {auction.highestBidderName || "No bids yet"}
      </p>
      <p className="text-blue-600 font-semibold mb-3">Ends in: {timeLeft}</p>

      {message && (
        <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded">
          {message}
        </div>
      )}

      {canBid && (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Your bid"
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

      {showBidHistory && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Bid History</h3>
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            <div className="flex bg-gray-100 px-3 py-2 font-semibold text-sm sticky top-0 z-10 border-b">
              <div className="flex-1">Bidder</div>
              <div className="w-20 text-right">Amount</div>
              <div className="w-28 text-right">Time</div>
            </div>
            {auction.bidHistory
              .slice()
              .reverse()
              .map((b, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center px-3 py-2 border-b last:border-0 hover:bg-gray-50 text-sm"
                >
                  <div className="flex-1">{b.bidderName}</div>
                  <div className="w-20 text-right">₹{b.amount}</div>
                  <div className="w-28 text-right text-gray-500">
                    {new Date(b.timestamp).toLocaleTimeString([], {
                      hour12: false,
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
