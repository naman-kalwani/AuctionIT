import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { socket } from "../socket";
import { useAuth } from "../context/useAuth";
import AuctionRoom from "./AuctionRoom";

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

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!auction)
    return <div className="text-center py-8">Auction not found</div>;

  return (
    <AuctionRoom
      auction={auction}
      currentUser={user}
      onBack={() => {
        setAuction(null);
        navigate("/home");
      }}
    />
  );
}
