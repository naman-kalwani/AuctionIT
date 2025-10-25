// src/components/AuctionRoom.jsx
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";

export default function AuctionRoom({ auction: initialAuction, onBack, user }) {
  // Use passed auction object directly (backend does not have GET /api/auctions/:id)
  const [auction, setAuction] = useState(initialAuction);
  const [currentBid, setCurrentBid] = useState(
    initialAuction.currentBid ?? initialAuction.basePrice
  );
  const [newBid, setNewBid] = useState("");
  const [message, setMessage] = useState("");
  const [ended, setEnded] = useState(initialAuction.ended);
  const auctionIdRef = useRef(initialAuction._id);

  useEffect(() => {
    auctionIdRef.current = initialAuction._id;
  }, [initialAuction._id]);

  useEffect(() => {
    // join room for real-time updates
    if (!socket.connected) {
      // when user is present, socket.auth is already set in App; connect will use it
      socket.connect();
      socket.once("connect", () =>
        socket.emit("join-auction", initialAuction._id)
      );
    } else {
      socket.emit("join-auction", initialAuction._id);
    }

    const bidHandler = (data) => {
      if (String(data.auctionId) === String(initialAuction._id)) {
        setCurrentBid(data.currentBid);
        setMessage(
          `✅ ${data.highestBidder} placed a new bid: ₹${Number(
            data.currentBid
          ).toLocaleString("en-IN")}`
        );
      }
    };

    const endHandler = (data) => {
      if (String(data.auctionId) === String(initialAuction._id)) {
        setEnded(true);
        setMessage(
          `🏁 Auction ended! Winner: ${data.winner} with ₹${Number(
            data.finalBid
          ).toLocaleString("en-IN")}`
        );
      }
    };

    socket.on("bid-updated", bidHandler);
    socket.on("auction-ended", endHandler);

    return () => {
      socket.emit("leave-auction", initialAuction._id);
      socket.off("bid-updated", bidHandler);
      socket.off("auction-ended", endHandler);
    };
  }, [initialAuction]);

  const placeBid = () => {
    if (!user) return setMessage("❌ Please login to place a bid.");
    if (ended) return setMessage("❌ Auction has ended.");
    const parsed = Number(newBid);
    if (!Number.isFinite(parsed) || parsed <= currentBid)
      return setMessage(`⚠️ Bid must be higher than ₹${currentBid}`);
    // server will pick username from socket.user (but we still pass bidderName optionally)
    socket.emit("place-bid", {
      auctionId: auction._id,
      amount: parsed,
    });
    setNewBid("");
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded-lg shadow mt-6 bg-white">
      {auction.image ? (
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-52 object-cover rounded mb-4"
        />
      ) : (
        <div className="w-full h-52 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">
          No image
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 text-center">{auction.title}</h2>

      <p className="text-gray-700 mb-4 text-center">
        Current Bid:{" "}
        <span className="text-green-600 font-semibold">
          ₹{currentBid.toLocaleString("en-IN")}
        </span>
      </p>

      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-center">
          {message}
        </div>
      )}

      <input
        type="number"
        placeholder="Bid Amount"
        value={newBid}
        onChange={(e) => setNewBid(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-4"
        disabled={ended || !user}
      />

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Back
        </button>
        <button
          onClick={placeBid}
          className={`px-4 py-2 rounded text-white ${
            ended || !user
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {ended ? "Auction Ended" : !user ? "Login to Bid" : "Place Bid"}
        </button>
      </div>
    </div>
  );
}

// // src/components/AuctionRoom.jsx
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { socket } from "../socket";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function AuctionRoom({ auction, onBack }) {
//   const [currentBid, setCurrentBid] = useState(
//     auction.currentBid ?? auction.basePrice
//   );
//   const [bidder, setBidder] = useState("");
//   const [newBid, setNewBid] = useState("");
//   const [message, setMessage] = useState("");
//   const [ended, setEnded] = useState(auction.ended);
//   const [loading, setLoading] = useState(false);
//   const auctionIdRef = useRef(auction._id);

//   useEffect(() => {
//     auctionIdRef.current = auction._id;
//   }, [auction._id]);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchAuction = async () => {
//       try {
//         setLoading(true);
//         const { data } = await axios.get(`${API}/api/auctions/${auction._id}`);
//         if (cancelled) return;
//         setCurrentBid(data.currentBid ?? data.basePrice);
//         setEnded(data.ended);
//       } catch (err) {
//         console.error("fetch auction error:", err);
//         setMessage("⚠️ Failed to fetch auction details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAuction();

//     // connect + join room properly
//     if (!socket.connected) {
//       socket.connect();
//       socket.once("connect", () => socket.emit("join-auction", auction._id));
//     } else {
//       socket.emit("join-auction", auction._id);
//     }

//     const bidHandler = (data) => {
//       if (String(data.auctionId) === String(auction._id)) {
//         setCurrentBid(data.currentBid);
//         setMessage(
//           `${data.highestBidder} placed a new bid: ₹${Number(
//             data.currentBid
//           ).toLocaleString("en-IN")}`
//         );
//       }
//     };

//     const outbidHandler = (data) => {
//       if (String(data.auctionId) === String(auction._id)) {
//         if (data.previousBidder)
//           setMessage(
//             `⚠️ ${data.previousBidder}, you were outbid! New bid: ₹${Number(
//               data.newBid
//             ).toLocaleString("en-IN")}`
//           );
//       }
//     };

//     const endHandler = (data) => {
//       if (String(data.auctionId) === String(auction._id)) {
//         setEnded(true);
//         setCurrentBid(data.finalBid ?? ((prev) => prev));
//         setMessage(
//           `🏁 Auction ended! Winner: ${data.winner} with ₹${Number(
//             data.finalBid
//           ).toLocaleString("en-IN")}`
//         );
//       }
//     };

//     const connectionErrorHandler = () =>
//       setMessage("⚠️ Connection lost. Retrying...");
//     const disconnectHandler = () => setMessage("⚠️ Disconnected from server.");

//     socket.on("bid-updated", bidHandler);
//     socket.on("outbid", outbidHandler);
//     socket.on("auction-ended", endHandler);
//     socket.on("connect_error", connectionErrorHandler);
//     socket.on("disconnect", disconnectHandler);

//     return () => {
//       cancelled = true;
//       socket.emit("leave-auction", auction._id);
//       socket.off("bid-updated", bidHandler);
//       socket.off("outbid", outbidHandler);
//       socket.off("auction-ended", endHandler);
//       socket.off("connect_error", connectionErrorHandler);
//       socket.off("disconnect", disconnectHandler);
//     };
//   }, [auction._id]);

//   const placeBid = () => {
//     if (ended) return setMessage("❌ Auction has ended.");
//     if (!bidder.trim())
//       return setMessage("⚠️ Please enter your name before bidding.");
//     const parsed = Number(newBid);
//     if (!newBid || !Number.isFinite(parsed) || parsed <= (currentBid ?? 0)) {
//       return setMessage(
//         `⚠️ Bid must be higher than ₹${(currentBid ?? 0).toLocaleString(
//           "en-IN"
//         )}`
//       );
//     }

//     socket.emit("place-bid", {
//       auctionId: auction._id,
//       bidderName: bidder.trim(),
//       amount: parsed,
//     });

//     setNewBid("");
//   };

//   const getMessageStyle = () => {
//     if (!message) return "hidden";
//     if (message.startsWith("⚠️"))
//       return "mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-center";
//     if (message.startsWith("🏁"))
//       return "mb-4 p-2 bg-green-100 text-green-800 rounded text-center";
//     return "mb-4 p-2 bg-blue-100 text-blue-800 rounded text-center";
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
//           ₹{(currentBid ?? auction.basePrice).toLocaleString("en-IN")}
//         </span>
//       </p>

//       {loading && (
//         <div className="mb-4 p-2 bg-gray-100 text-gray-700 rounded text-center animate-pulse">
//           Fetching latest auction data...
//         </div>
//       )}

//       {message && <div className={getMessageStyle()}>{message}</div>}

//       <div className="flex flex-col gap-3 mb-4">
//         <input
//           type="text"
//           placeholder="Your Name"
//           value={bidder}
//           onChange={(e) => setBidder(e.target.value)}
//           className="border rounded px-3 py-2"
//           disabled={ended}
//         />
//         <input
//           type="number"
//           placeholder="Bid Amount"
//           value={newBid}
//           onChange={(e) => setNewBid(e.target.value)}
//           className="border rounded px-3 py-2"
//           disabled={ended}
//         />
//       </div>

//       <div className="flex justify-between">
//         <button
//           onClick={onBack}
//           className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={placeBid}
//           className={`px-4 py-2 rounded text-white ${
//             ended
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700"
//           } transition`}
//         >
//           {ended ? "Auction Ended" : "Place Bid"}
//         </button>
//       </div>
//     </div>
//   );
// }
