import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { api } from "../api";
import { useAuth } from "../context/useAuth";
import AuctionList from "../components/AuctionList";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [view, setView] = useState("all");

  const loadAuctions = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auctions");
      setAuctions(
        data.map((a) => ({
          ...a,
          highestBidderName: a.highestBidder?.username || null,
          bidHistory:
            a.bidHistory?.map((b) => ({
              ...b,
              bidderName: b.userId?.username || "Unknown",
            })) || [],
        }))
      );
    } catch (err) {
      console.error("fetch auctions error:", err);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  // SOCKET REAL-TIME UPDATES
  useEffect(() => {
    socket.on("bid-updated", (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a._id === data.auctionId
            ? {
                ...a,
                currentBid: data.currentBid,
                highestBidderName: data.highestBidderName,
                bidHistory: data.bidHistory,
              }
            : a
        )
      );
    });

    socket.on("auction-ended", (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a._id === data.auctionId
            ? { ...a, ended: true, currentBid: data.finalBid }
            : a
        )
      );
    });

    return () => {
      socket.off("bid-updated");
      socket.off("auction-ended");
    };
  }, []);

  const filteredAuctions = (() => {
    // "all" -> show only live auctions
    if (view === "all") return auctions.filter((a) => !a.ended);

    // "past" -> show last 20 ended auctions sorted by end date (most recent first)
    if (view === "past") {
      return auctions
        .filter((a) => a.ended)
        .sort((a, b) => new Date(b.endAt) - new Date(a.endAt))
        .slice(0, 20);
    }

    if (!user) return auctions.filter((a) => !a.ended);

    if (view === "mine") {
      return auctions.filter(
        (a) => a.owner?.username === user.username 
      );
    }

    if (view === "bids") {
      return auctions.filter((a) =>
        a.bidHistory?.some((b) => b.bidderName === user.username)
      );
    }

    return auctions;
  })();

  return (
    <>
      {user && (
        <div className="flex justify-between mb-4">
          <div className="flex gap-3">
            {["all", "mine", "bids", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  view === tab
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border hover:bg-gray-100"
                }`}
              >
                {tab === "all"
                  ? "Live Auctions"
                  : tab === "mine"
                  ? "My Auctions"
                  : tab === "bids"
                  ? "My Bids"
                  : "Past Auctions"}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow cursor-pointer"
          >
            + Create Auction
          </button>
        </div>
      )}

      <AuctionList
        auctions={filteredAuctions}
        onSelect={(a) =>
          user ? navigate(`/auction/${a._id}`) : navigate("/login")
        }
      />
    </>
  );
}
