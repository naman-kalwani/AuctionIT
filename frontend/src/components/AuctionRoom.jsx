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

  // Setup socket once
  useEffect(() => {
    if (!auction) return;

    const newSocket = socketIOClient(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      { auth: { token: currentUser?.token } }
    );

    setSocket(newSocket);
    newSocket.emit("join-auction", auction._id);

    newSocket.on("bid-updated", (data) => {
      if (data.auctionId === auction._id) {
        setAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidder,
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

  const isOwner = currentUser?.id === auction?.owner;
  const canBid = !auction.ended && !isOwner;

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

      {auction.bidHistory?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Bid History</h3>
          <ul className="border rounded p-2 max-h-48 overflow-y-auto">
            {auction.bidHistory
              .slice()
              .reverse()
              .map((b, idx) => (
                <li key={idx}>
                  {b.bidderName || "Unknown"}: ₹{b.amount} at{" "}
                  {new Date(b.timestamp).toLocaleString()}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// // src/components/AuctionRoom.jsx
// import { useEffect, useState, useRef } from "react";
// import { socket } from "../socket";

// export default function AuctionRoom({ auction: initialAuction, onBack, user }) {
//   // Use passed auction object directly (backend does not have GET /api/auctions/:id)
//   const [auction, setAuction] = useState(initialAuction);
//   const [currentBid, setCurrentBid] = useState(
//     initialAuction.currentBid ?? initialAuction.basePrice
//   );
//   const [newBid, setNewBid] = useState("");
//   const [message, setMessage] = useState("");
//   const [ended, setEnded] = useState(initialAuction.ended);
//   const auctionIdRef = useRef(initialAuction._id);

//   useEffect(() => {
//     auctionIdRef.current = initialAuction._id;
//   }, [initialAuction._id]);

//   useEffect(() => {
//     // join room for real-time updates
//     if (!socket.connected) {
//       // when user is present, socket.auth is already set in App; connect will use it
//       socket.connect();
//       socket.once("connect", () =>
//         socket.emit("join-auction", initialAuction._id)
//       );
//     } else {
//       socket.emit("join-auction", initialAuction._id);
//     }

//     const bidHandler = (data) => {
//       if (String(data.auctionId) === String(initialAuction._id)) {
//         setCurrentBid(data.currentBid);
//         setMessage(
//           `✅ ${data.highestBidder} placed a new bid: ₹${Number(
//             data.currentBid
//           ).toLocaleString("en-IN")}`
//         );
//       }
//     };

//     const endHandler = (data) => {
//       if (String(data.auctionId) === String(initialAuction._id)) {
//         setEnded(true);
//         setMessage(
//           `🏁 Auction ended! Winner: ${data.winner} with ₹${Number(
//             data.finalBid
//           ).toLocaleString("en-IN")}`
//         );
//       }
//     };

//     socket.on("bid-updated", bidHandler);
//     socket.on("auction-ended", endHandler);

//     return () => {
//       socket.emit("leave-auction", initialAuction._id);
//       socket.off("bid-updated", bidHandler);
//       socket.off("auction-ended", endHandler);
//     };
//   }, [initialAuction]);

//   const placeBid = () => {
//     if (!user) return setMessage("❌ Please login to place a bid.");
//     if (ended) return setMessage("❌ Auction has ended.");
//     const parsed = Number(newBid);
//     if (!Number.isFinite(parsed) || parsed <= currentBid)
//       return setMessage(`⚠️ Bid must be higher than ₹${currentBid}`);
//     // server will pick username from socket.user (but we still pass bidderName optionally)
//     socket.emit("place-bid", {
//       auctionId: auction._id,
//       amount: parsed,
//     });
//     setNewBid("");
//   };

//   return (
//     <div className="max-w-xl mx-auto p-6 border rounded-lg shadow mt-6 bg-white">
//       {auction.image ? (
//         <img
//           src={auction.image}
//           alt={auction.title}
//           className="w-full h-52 object-cover rounded mb-4"
//         />
//       ) : (
//         <div className="w-full h-52 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">
//           No image
//         </div>
//       )}

//       <h2 className="text-2xl font-bold mb-4 text-center">{auction.title}</h2>

//       <p className="text-gray-700 mb-4 text-center">
//         Current Bid:{" "}
//         <span className="text-green-600 font-semibold">
//           ₹{currentBid.toLocaleString("en-IN")}
//         </span>
//       </p>

//       {message && (
//         <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-center">
//           {message}
//         </div>
//       )}

//       <input
//         type="number"
//         placeholder="Bid Amount"
//         value={newBid}
//         onChange={(e) => setNewBid(e.target.value)}
//         className="border rounded px-3 py-2 w-full mb-4"
//         disabled={ended || !user}
//       />

//       <div className="flex justify-between">
//         <button
//           onClick={onBack}
//           className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={placeBid}
//           className={`px-4 py-2 rounded text-white ${
//             ended || !user
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700"
//           }`}
//         >
//           {ended ? "Auction Ended" : !user ? "Login to Bid" : "Place Bid"}
//         </button>
//       </div>
//     </div>
//   );
// }
