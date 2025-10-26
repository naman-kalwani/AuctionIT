import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { socket } from "./socket";
import { api } from "./api";
import { useAuth } from "./context/useAuth";
// Auction list moved into Home page
import NotificationPanel from "./components/NotificationPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import AuctionRoom from "./pages/AuctionRoom";
import CreateAuction from "./pages/CreateAuction";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function AuctionRoomPage() {
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

    const onBidUpdated = (data) => {
      if (String(auction._id) === String(data.auctionId)) {
        setAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory,
        }));
      }
    };

    const onAuctionEnded = (data) => {
      if (String(auction._id) === String(data.auctionId)) {
        setAuction((prev) => ({
          ...prev,
          ended: true,
          currentBid: data.finalBid,
        }));
      }
    };

    socket.on("bid-updated", onBidUpdated);
    socket.on("auction-ended", onAuctionEnded);
    return () => {
      socket.off("bid-updated", onBidUpdated);
      socket.off("auction-ended", onAuctionEnded);
    };
  }, [auction, user]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!auction)
    return <div className="text-center py-8">Auction not found</div>;
  return (
    <AuctionRoom
      auction={auction}
      currentUser={user}
      onBack={() => navigate("/")}
    />
  );
}

function CreateAuctionPage() {
  const navigate = useNavigate();
  return (
    <CreateAuction
      onCreated={(created) => navigate(`/auction/${created._id}`)}
      onBack={() => navigate("/")}
    />
  );
}

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dingSound = useRef(null);

  useEffect(() => {
    dingSound.current = new Audio("/sounds/ding.mp3");
    dingSound.current.volume = 0.6;
  }, []);

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

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    socket.auth = { token: user.token };
    if (!socket.connected) socket.connect();

    const onNotification = (n) => {
      dingSound.current?.play();
      setNotifications((prev) => [n, ...prev]);
    };

    socket.on("notification", onNotification);
    return () => socket.off("notification", onNotification);
  }, [user, loadNotifications]);

  const unread = notifications.length;
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-semibold tracking-tight cursor-pointer"
        >
          AuctionIT💸
        </h1>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div
                className="relative cursor-pointer"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <span className="text-2xl">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
              <span className="font-medium">{user.username} 👤</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-black cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
        {user && (
          <div
            className={`absolute top-12 right-0 z-50 w-80 transition-transform duration-300 ${
              showDropdown
                ? "translate-y-0 opacity-100"
                : "-translate-y-10 opacity-0 pointer-events-none"
            }`}
          >
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowDropdown(false)}
            />
          </div>
        )}
      </header>
      <main className="max-w-5xl mx-auto py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateAuctionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auction/:id"
            element={
              <ProtectedRoute>
                <AuctionRoomPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
