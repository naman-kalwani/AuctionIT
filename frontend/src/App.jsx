import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { api } from "./api";
import { useAuth } from "./context/useAuth";
// Auction list moved into Home page
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AuctionRoomPage from "./pages/AuctionRoomPage";
import CreateAuctionPage from "./pages/CreateAuctionPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  // dropdown state moved into Navbar
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

  // const unread = notifications.length;
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800">
      <Navbar
        user={user}
        notifications={notifications}
        loadNotifications={loadNotifications}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
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
