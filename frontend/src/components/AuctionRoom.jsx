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
  const timerRef = useRef(null);

  const isOwner = auction.owner?.username
    ? auction.owner.username === currentUser?.username
    : auction.owner === currentUser?.id;

  const canBid = !auction.ended && !isOwner;
  const showBidHistory = isOwner;

  // Sync auction updates & join socket room
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

  // Countdown timer
  useEffect(() => {
    if (!auction) return;

    const updateTimer = () => {
      const diff = new Date(auction.endAt) - new Date();
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        setAuction((prev) => ({ ...prev, ended: true }));
        clearInterval(timerRef.current);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
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
    <div className="max-w-xl mx-auto p-6 border rounded shadow bg-white mt-6">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-2">{auction.title}</h2>
      <p>Category: {auction.category}</p>
      <p>Description: {auction.description}</p>
      {auction.image && (
        <img
          src={auction.image}
          alt="Auction"
          className="my-4 max-h-60 w-full object-cover rounded"
        />
      )}
      <p>Base Price: ₹{auction.basePrice}</p>
      <p>Current Bid: ₹{auction.currentBid}</p>
      <p>Highest Bidder: {auction.highestBidderName || "No bids yet"}</p>
      <p>
        Ends At: {new Date(auction.endAt).toLocaleString()} ({timeLeft})
      </p>

      {message && (
        <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
          {message}
        </div>
      )}

      {canBid && (
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Your bid"
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={placeBid}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Place Bid
          </button>
        </div>
      )}

      {showBidHistory && auction.bidHistory?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Bid History</h3>
          <ul className="border rounded p-2 max-h-48 overflow-y-auto">
            {auction.bidHistory
              .slice()
              .reverse()
              .map((b, idx) => (
                <li key={idx}>
                  {b.bidderName || b.userId?.username || "Unknown"}: ₹{b.amount}{" "}
                  at {new Date(b.timestamp).toLocaleString()}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
