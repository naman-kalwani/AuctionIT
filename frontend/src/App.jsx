import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { api } from "./api";
import { useAuth } from "./context/useAuth";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AuctionRoomPage from "./pages/AuctionRoomPage";
import CreateAuctionPage from "./pages/CreateAuctionPage";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const dingSound = useRef(null);

  // preload sound
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

  // connect socket & handle notifications
  useEffect(() => {
    if (!user) return;

    socket.auth = { token: user.token };
    if (!socket.connected) socket.connect();

    const handleNotification = (n) => {
      dingSound.current?.play();
      setNotifications((prev) => [n, ...prev]);
    };

    socket.on("notification", handleNotification);
    loadNotifications();

    return () => socket.off("notification", handleNotification);
  }, [user, loadNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa] text-gray-800">
      <Navbar
        user={user}
        notifications={notifications}
        loadNotifications={loadNotifications}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
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
      <Footer />
    </div>
  );
}
