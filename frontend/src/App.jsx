import { useState, useEffect, useRef } from "react";
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
  const loadAuctions = async () => {
    try {
      const { data } = await api.get("/api/auctions");
      const formatted = data.map((a) => ({
        ...a,
        highestBidderName: a.highestBidder?.username || null,
        bidHistory:
          a.bidHistory?.map((b) => ({
            ...b,
            bidderName: b.userId?.username || "Unknown",
          })) || [],
      }));
      setAuctions(formatted);
    } catch (err) {
      console.error("fetch auctions error:", err);
    }
  };

  // Load notifications from backend
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/notifications", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications(data);
    } catch (err) {
      console.error("fetch notifications error:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadAuctions();
    loadNotifications();

    // Setup socket
    socket.auth = { token: user.token };
    if (!socket.connected) socket.connect();

    // Socket listeners
    const onAuctionCreated = (newAuction) => loadAuctions(); // reload after new auction
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
    };
    const onAuctionEnded = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a._id === data.auctionId
            ? { ...a, ended: true, currentBid: data.finalBid ?? a.currentBid }
            : a
        )
      );
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
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-4 relative">
        <h1 className="font-bold text-xl">Welcome, {user?.username}</h1>

        {/* 🔔 Notification Bell */}
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

      {!selectedAuction && !showCreate && (
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
            loadAuctions(); // reload auctions from DB
            setSelectedAuction(created);
          }}
          onBack={() => setShowCreate(false)}
        />
      )}

      {selectedAuction && (
        <AuctionRoom
          auction={
            auctions.find((a) => a._id === selectedAuction._id) ||
            selectedAuction
          }
          currentUser={user}
          onBack={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
}
