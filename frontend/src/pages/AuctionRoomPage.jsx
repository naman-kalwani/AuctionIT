import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { socket } from "../socket";
import { useAuth } from "../context/useAuth";
import AuctionRoom from "./AuctionRoom";

function AuctionRoomSkeleton() {
  return (
    <div className="min-h-[calc(100vh-200px)] py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-6 px-4">
        {/* LEFT PANEL SKELETON */}
        <div className="space-y-4">
          <div className="h-10 w-48 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse" />
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-6">
              <div className="h-48 w-full bg-gray-100 border border-gray-100 rounded-xl animate-pulse" />
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-28 bg-gray-100 border border-gray-100 rounded-xl animate-pulse" />
              <div className="h-28 bg-gray-100 border border-gray-100 rounded-xl animate-pulse" />
            </div>
            <div className="p-6 border-t border-gray-100">
              <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL SKELETON (Bid History) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="p-4 space-y-3 overflow-y-auto h-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 border border-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuctionRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAuction = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/auctions/${id}`);
      setAuction({
        ...data,
        highestBidderName: data.highestBidder?.username || null,
        bidHistory:
          data.bidHistory?.map((b) => ({
            ...b,
            bidderName: b.userId?.username || "Unknown",
          })) || [],
      });
    } catch (err) {
      console.error("fetch auction error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  // SOCKET REAL-TIME UPDATES
  useEffect(() => {
    if (!auction || !user) return;

    socket.auth = { token: user.token };
    if (!socket.connected) socket.connect();

    const handleBidUpdated = (data) => {
      if (String(auction._id) === String(data.auctionId)) {
        setAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory,
        }));
      }
    };

    const handleAuctionEnded = (data) => {
      if (String(auction._id) === String(data.auctionId)) {
        setAuction((prev) => ({
          ...prev,
          ended: true,
          currentBid: data.finalBid,
        }));
      }
    };

    socket.on("bid-updated", handleBidUpdated);
    socket.on("auction-ended", handleAuctionEnded);

    return () => {
      socket.off("bid-updated", handleBidUpdated);
      socket.off("auction-ended", handleAuctionEnded);
    };
  }, [auction, user]);

  if (loading)
    return (
      <>
        <style>{`
        @keyframes fadeInSmooth { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fadeInSmooth { animation: fadeInSmooth .35s ease-out; }
      `}</style>
        <AuctionRoomSkeleton />
      </>
    );
  if (!auction)
    return <div className="text-center py-8">Auction not found</div>;

  return (
    <>
      <style>{`
        @keyframes fadeInSmooth { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fadeInSmooth { animation: fadeInSmooth .35s ease-out; }
      `}</style>
      <div className="animate-fadeInSmooth">
        <AuctionRoom
          auction={auction}
          currentUser={user}
          onBack={() => {
            setAuction(null);
            navigate("/home");
          }}
        />
      </div>
    </>
  );
}
