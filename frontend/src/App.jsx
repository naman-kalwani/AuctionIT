// src/App.jsx
import { useState, useEffect } from "react";
import AuctionList from "./components/AuctionList";
import AuctionRoom from "./components/AuctionRoom";
import CreateAuction from "./components/CreateAuction";
import { socket } from "./socket";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/api/auctions`)
      .then((res) => mounted && setAuctions(res.data || []))
      .catch((err) => console.error("fetch auctions:", err));

    if (!socket.connected) socket.connect();

    const onBidUpdated = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          String(a._id) === String(data.auctionId)
            ? {
                ...a,
                currentBid: data.currentBid,
                highestBidder: data.highestBidder,
              }
            : a
        )
      );
    };

    const onAuctionEnded = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          String(a._id) === String(data.auctionId)
            ? { ...a, ended: true, currentBid: data.finalBid ?? a.currentBid }
            : a
        )
      );
    };

    const onAuctionCreated = (newAuction) => {
      setAuctions((prev) => [newAuction, ...prev]);
    };

    socket.on("bid-updated", onBidUpdated);
    socket.on("auction-ended", onAuctionEnded);
    socket.on("auction-created", onAuctionCreated);

    return () => {
      mounted = false;
      socket.off("bid-updated", onBidUpdated);
      socket.off("auction-ended", onAuctionEnded);
      socket.off("auction-created", onAuctionCreated);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {!selectedAuction && !showCreate && (
        <>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Create Auction
            </button>
          </div>

          <AuctionList auctions={auctions} onSelect={setSelectedAuction} />
        </>
      )}

      {showCreate && (
        <CreateAuction
          onCreated={(created) => {
            setShowCreate(false);
            setSelectedAuction(created);
            setTimeout(() => setSelectedAuction(null), 500); // keep selection brief
          }}
          onBack={() => setShowCreate(false)}
        />
      )}

      {selectedAuction && (
        <AuctionRoom
          auction={
            auctions.find(
              (a) => String(a._id) === String(selectedAuction._id)
            ) || selectedAuction
          }
          onBack={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
}

export default App;
