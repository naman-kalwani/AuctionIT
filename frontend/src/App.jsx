import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "./socket";
import { api } from "./api";
import { useAuth } from "./context/useAuth";

import AuctionList from "./components/AuctionList";
import AuctionRoom from "./components/AuctionRoom";
import CreateAuction from "./components/CreateAuction";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(user ? "home" : "login");
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dingSound = useRef(null);

  useEffect(() => {
    dingSound.current = new Audio("/sounds/ding.mp3");
    dingSound.current.volume = 0.6;
  }, []);

  // Load auctions from backend
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

  // Load notifications from backend
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/notifications", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications(data);
    } catch (err) {
      console.error("fetch notifications error:", err);
    }
  }, [user]);

  // Socket setup & live updates
  useEffect(() => {
    if (!user) return;

    loadAuctions();
    loadNotifications();

    socket.auth = { token: user.token };
    if (!socket.connected) socket.connect();

    // Auction events
    const onAuctionCreated = (newAuction) => {
      setAuctions((prev) => [newAuction, ...prev]);
    };

    const onBidUpdated = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a._id === data.auctionId
            ? {
                ...a,
                currentBid: data.currentBid,
                highestBidderName: data.highestBidderName,
                bidHistory: data.bidHistory || a.bidHistory,
              }
            : a
        )
      );

      // Also update selectedAuction if the user is inside that room
      if (selectedAuction?._id === data.auctionId) {
        setSelectedAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory || prev.bidHistory,
        }));
      }
    };

    const onAuctionEnded = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a._id === data.auctionId
            ? { ...a, ended: true, currentBid: data.finalBid ?? a.currentBid }
            : a
        )
      );

      if (selectedAuction?._id === data.auctionId) {
        setSelectedAuction((prev) => ({
          ...prev,
          ended: true,
          currentBid: data.finalBid ?? prev.currentBid,
        }));
      }
    };

    const onNotification = (n) => {
      dingSound.current?.play();
      setNotifications((prev) => [n, ...prev]);
    };

    socket.on("auction-created", onAuctionCreated);
    socket.on("bid-updated", onBidUpdated);
    socket.on("auction-ended", onAuctionEnded);
    socket.on("notification", onNotification);

    return () => {
      socket.off("auction-created", onAuctionCreated);
      socket.off("bid-updated", onBidUpdated);
      socket.off("auction-ended", onAuctionEnded);
      socket.off("notification", onNotification);
    };
  }, [user, loadAuctions, loadNotifications, selectedAuction]);

  const unread = notifications.length;

  if (!user && page === "login")
    return (
      <Login
        onSwitch={() => setPage("signup")}
        onLoginSuccess={() => setPage("home")}
      />
    );
  if (!user && page === "signup")
    return (
      <Signup
        onSwitch={() => setPage("login")}
        onSignupSuccess={() => setPage("home")}
      />
    );

  const currentAuction = selectedAuction
    ? auctions.find((a) => a._id === selectedAuction._id) || selectedAuction
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-4 relative">
        <h1 className="font-bold text-xl">Welcome, {user?.username}</h1>

        <div
          className="relative mr-4 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="text-2xl">🔔</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
              {unread}
            </span>
          )}
        </div>

        {showDropdown && (
          <div className="absolute right-12 top-10 bg-white border shadow-md w-64 rounded max-h-64 overflow-y-auto z-50">
            {notifications.length === 0 ? (
              <p className="p-3 text-gray-500 text-center">No Notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-3 border-b last:border-0 hover:bg-gray-100"
                >
                  <p className="font-medium">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={() => logout()}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {!currentAuction && !showCreate && (
        <>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
            loadAuctions();
            setSelectedAuction(created);
          }}
          onBack={() => setShowCreate(false)}
        />
      )}

      {currentAuction && (
        <AuctionRoom
          auction={currentAuction}
          currentUser={user}
          onBack={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
}
