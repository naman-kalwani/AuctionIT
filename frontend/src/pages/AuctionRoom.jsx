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
    <div className="min-h-[calc(100vh-200px)] py-6 bg-gray-50">
      <div
        className={`max-w-7xl mx-auto grid ${
          showBidHistory ? "lg:grid-cols-[1.5fr_1fr]" : "lg:grid-cols-1"
        } gap-6 px-4`}
      >
        {/* LEFT PANEL */}
        <div className="space-y-4">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white rounded-xl hover:shadow-md font-medium transition-all cursor-pointer flex items-center gap-2 group shadow-sm border border-gray-200"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="font-semibold text-gray-700">
              Back to Auctions
            </span>
          </button>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {auction.title}
                </h1>
                {!auction.ended && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-full font-bold text-xs shadow-lg animate-pulse shrink-0">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    LIVE
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-md"
                  style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
                >
                  📦 {auction.category}
                </span>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="text-lg">👤</span>
                  <span className="font-semibold">
                    {auction.owner?.username || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 sm:p-6 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {auction.description}
              </p>
            </div>

            {/* Image */}
            {auction.image && (
              <div className="p-5 sm:p-6 bg-white">
                <div className="rounded-xl overflow-hidden bg-gray-50 flex justify-center border border-gray-200 group">
                  <img
                    src={auction.image}
                    alt="Auction"
                    className="object-contain max-h-64 w-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
              {/* Current Bid Card */}
              <div className="rounded-xl p-4 text-center shadow-md border-2 border-gray-100 bg-linear-to-br from-white to-gray-50 hover:shadow-lg transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Starting Price
                </p>
                <p className="text-lg font-bold text-gray-600 mb-3">
                  ₹{auction.basePrice?.toLocaleString("en-IN")}
                </p>
                <div className="border-t-2 border-gray-200 pt-3 mt-2">
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: "oklch(37.9% .146 265.522)" }}
                  >
                    {auction.ended ? "🏆 Final Bid" : "💰 Current Bid"}
                  </p>
                  <p
                    className={`text-3xl font-black transition-all duration-300 ${
                      highlight ? "scale-110" : "scale-100"
                    }`}
                    style={{ color: "oklch(37.9% .146 265.522)" }}
                  >
                    ₹{auction.currentBid?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Time & Bidder Card */}
              <div className="rounded-xl p-4 text-center shadow-md border-2 border-gray-100 bg-linear-to-br from-orange-50 to-amber-50 hover:shadow-lg transition-shadow">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                  👑 Top Bidder
                </p>
                <p className="text-lg font-bold text-gray-800 mb-3 truncate">
                  {auction.highestBidderName || "No bids yet"}
                </p>
                <div className="border-t-2 border-orange-200 pt-3 mt-2">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                    {auction.ended ? "⏰ Ended" : "⏰ Time Left"}
                  </p>
                  <p className="text-3xl font-black text-orange-600 font-mono">
                    {timeLeft}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Alert */}
            {message && (
              <div className="p-5 sm:p-6 bg-yellow-50 border-t border-yellow-100">
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border-l-4 border-yellow-500 shadow-sm">
                  <span className="text-xl">⚠️</span>
                  <p className="text-yellow-900 font-semibold flex-1 text-sm">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* Bidding Section */}
            {canBid && (
              <div className="p-5 sm:p-6 bg-white border-t border-gray-100">
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "oklch(37.9% .146 265.522)" }}
                >
                  🎯 Place Your Bid
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={decrementBid}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-bold text-xl shadow-sm"
                  >
                    -
                  </button>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-opacity-80 transition text-lg font-bold text-gray-900"
                      style={{
                        borderColor: "oklch(37.9% .146 265.522)",
                      }}
                    />
                  </div>
                  <button
                    onClick={incrementBid}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-bold text-xl shadow-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={placeBid}
                    className="text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105 shadow-md"
                    style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
                  >
                    Place Bid 🚀
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    onClick={() => setBidAmount((prev) => Number(prev) + 500)}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-xs font-bold text-gray-700"
                  >
                    +₹500
                  </button>
                  <button
                    onClick={() => setBidAmount((prev) => Number(prev) + 1000)}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-xs font-bold text-gray-700"
                  >
                    +₹1,000
                  </button>
                  <button
                    onClick={() => setBidAmount((prev) => Number(prev) + 5000)}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-xs font-bold text-gray-700"
                  >
                    +₹5,000
                  </button>
                </div>
              </div>
            )}

            {/* Auction Ended State */}
            {auction.ended && (
              <div className="p-5 sm:p-6 bg-red-50 border-t border-red-100">
                <div className="bg-white p-5 rounded-xl text-center border-2 border-red-200 shadow-md">
                  <p className="text-2xl font-black text-red-600 mb-2">
                    🏁 Auction Ended
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
                    <span className="font-semibold">Winner:</span>
                    <span
                      className="font-black text-lg"
                      style={{ color: "oklch(37.9% .146 265.522)" }}
                    >
                      {auction.highestBidderName || "No winner"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Bid History */}
        {showBidHistory && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BidHistory
              bids={auction.bidHistory}
              currentBid={auction.currentBid}
              basePrice={auction.basePrice}
              ended={auction.ended}
              currentUser={currentUser}
              className="lg:h-[calc(100vh-140px)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
