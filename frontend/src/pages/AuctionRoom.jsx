import { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "../socket";
import BidHistory from "../components/BidHistory";

export default function AuctionRoom({
  auction: initialAuction,
  currentUser,
  onBack,
}) {
  const [auction, setAuction] = useState(initialAuction);
  const [bidAmount, setBidAmount] = useState(
    initialAuction.currentBid ?? initialAuction.basePrice ?? 0
  );
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

    const handleBidUpdated = (data) => {
      if (data.auctionId !== initialAuction._id) return;

      setAuction((prev) => {
        if (data.currentBid > (prev.currentBid ?? prev.basePrice ?? 0))
          setHighlight(true);
        return {
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory || prev.bidHistory,
        };
      });

      setTimeout(() => setHighlight(false), 600);
      new Audio("/ding.mp3").play().catch(() => {});
    };

    const handleAuctionEnded = (data) => {
      if (data.auctionId !== initialAuction._id) return;
      setAuction((prev) => ({ ...prev, ended: true }));
      setMessage(
        `🏁 Auction ended — Winner: ${data.winner}, Final Bid: ₹${data.finalBid}`
      );
    };

    socket.on("bid-updated", handleBidUpdated);
    socket.on("auction-ended", handleAuctionEnded);

    return () => {
      socket.emit("leave-auction", initialAuction._id);
      socket.off("bid-updated", handleBidUpdated);
      socket.off("auction-ended", handleAuctionEnded);
    };
  }, [initialAuction]);

  // TIMER (fixed)
  const updateTimer = useCallback(() => {
    const diff = new Date(auction.endAt) - new Date();
    if (diff <= 0) {
      setTimeLeft("Auction ended");
      if (!auction.ended) {
        setAuction((prev) => ({ ...prev, ended: true }));
      }
      clearInterval(timerRef.current);
    } else {
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    }
  }, [auction.endAt, auction.ended]);

  useEffect(() => {
    if (!auction?.endAt) return;
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [auction.endAt, updateTimer]);

  // PLACE BID
  const placeBid = () => {
    const amount = Number(bidAmount);
    if (!amount || amount <= (auction.currentBid ?? auction.basePrice ?? 0)) {
      setMessage("❌ Bid must be higher than current bid");
      return;
    }
    socket.emit("place-bid", { auctionId: auction._id, amount });
    setBidAmount(amount);
    setMessage("");
  };

  const incrementBid = () => setBidAmount((prev) => Number(prev) + 100);
  const decrementBid = () =>
    setBidAmount((prev) =>
      Math.max(prev - 100, auction.currentBid ?? auction.basePrice ?? 0)
    );

  return (
    <div
      className={`max-w-6xl mx-auto mt-8 grid ${
        showBidHistory ? "md:grid-cols-[2fr_1fr]" : "md:grid-cols-1"
      } gap-6 px-4`}
    >
      {/* LEFT PANEL */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <button
          onClick={onBack}
          className="mb-4 px-3 py-1 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition cursor-pointer"
        >
          ← Back
        </button>

        <div className="flex justify-between items-start mb-3">
          <h2 className="text-2xl font-bold truncate">{auction.title}</h2>
          {!auction.ended && (
            <span className="bg-green-800 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
              LIVE 🟢
            </span>
          )}
        </div>

        <p className="text-gray-500 mb-2">
          Category:{" "}
          <span className="text-gray-700 font-medium">{auction.category}</span>
        </p>
        <p className="text-gray-600 mb-5">{auction.description}</p>

        {auction.image && (
          <div className="rounded-xl overflow-hidden mb-5 border bg-gray-50 flex justify-center shadow-sm">
            <img
              src={auction.image}
              alt="Auction"
              className="object-contain max-h-72 w-full hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center shadow-inner">
            <p className="text-sm text-gray-400">Base Price</p>
            <p className="text-xl font-bold text-gray-800">
              ₹{auction.basePrice}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {auction.ended ? "Final Bid" : "Current Bid"}
            </p>
            <p
              className={`text-2xl font-extrabold ${
                highlight ? "text-green-600 scale-105" : "text-gray-900"
              } transition-transform`}
            >
              ₹{auction.currentBid}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center shadow-inner">
            <p className="text-sm text-gray-400">Highest Bidder</p>
            <p className="text-lg font-semibold text-gray-700">
              {auction.highestBidderName || "No bids yet"}
            </p>
            <p className="text-sm text-blue-600 mt-2">Ends in:</p>
            <p className="text-2xl font-bold text-gray-900">{timeLeft}</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-900 rounded-xl font-medium shadow animate-pulse">
            {message}
          </div>
        )}

        {canBid && (
          <div className="flex items-center gap-3">
            <button
              onClick={decrementBid}
              className="px-3 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition font-semibold"
            >
              -
            </button>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <button
              onClick={incrementBid}
              className="px-3 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition font-semibold"
            >
              +
            </button>
            <button
              onClick={placeBid}
              className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700 transition transform hover:scale-105"
            >
              Place Bid
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Only show if there's bid history */}
      {showBidHistory && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 md:sticky md:top-6 md:h-full max-h-[calc(100vh-8rem)] overflow-y-auto">
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
