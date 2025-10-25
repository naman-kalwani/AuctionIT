// src/components/AuctionRoom.jsx
import { useEffect, useState } from "react";
import { io as socketIOClient } from "socket.io-client";

export default function AuctionRoom({
  auction: initialAuction,
  currentUser,
  onBack,
}) {
  const [auction, setAuction] = useState(initialAuction);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Setup socket
  useEffect(() => {
    if (!auction) return;

    const newSocket = socketIOClient(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token: currentUser?.token },
      }
    );

    setSocket(newSocket);
    newSocket.emit("join-auction", auction._id);

    newSocket.on("bid-updated", (data) => {
      if (data.auctionId === auction._id) {
        setAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory,
        }));
      }
    });

    newSocket.on("auction-ended", (data) => {
      if (data.auctionId === auction._id) {
        setAuction((prev) => ({ ...prev, ended: true }));
        setMessage(
          `Auction ended. Winner: ${data.winner}, Final Bid: ₹${data.finalBid}`
        );
      }
    });

    return () => {
      newSocket.emit("leave-auction", auction._id);
      newSocket.disconnect();
    };
  }, [auction, currentUser]);

  // Countdown timer
  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const diff = new Date(auction.endAt) - new Date();
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        clearInterval(interval);
        setAuction((prev) => ({ ...prev, ended: true }));
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const placeBid = () => {
    if (
      !bidAmount ||
      Number(bidAmount) <= (auction?.currentBid ?? auction?.basePrice ?? 0)
    ) {
      setMessage("❌ Bid must be higher than current bid");
      return;
    }
    socket.emit("place-bid", {
      auctionId: auction._id,
      amount: Number(bidAmount),
    });
    setBidAmount("");
  };

  // Check if current user is the auction owner
  const isOwner = auction.owner?.username
    ? auction.owner.username === currentUser?.username
    : auction.owner === currentUser?.id;

  const canBid = !auction.ended && !isOwner;
  const showBidHistory = isOwner;

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
