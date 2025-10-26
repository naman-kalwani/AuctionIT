import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "./socket";
import { api } from "./api";
import { useAuth } from "./context/useAuth";

import AuctionList from "./components/AuctionList";
import AuctionRoom from "./components/AuctionRoom";
import CreateAuction from "./components/CreateAuction";
import NotificationPanel from "./components/NotificationPanel";
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
  const [view, setView] = useState("all");
  const dingSound = useRef(null);

  useEffect(() => {
    dingSound.current = new Audio("/sounds/ding.mp3");
    dingSound.current.volume = 0.6;
  }, []);

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
    loadAuctions();
    if (!user) return;

    loadNotifications();
    socket.auth = { token: user.token };
    if (!socket.connected) socket.connect();

    const onAuctionCreated = (a) => setAuctions((prev) => [a, ...prev]);
    const onBidUpdated = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          String(a._id) === String(data.auctionId)
            ? {
                ...a,
                currentBid: data.currentBid,
                highestBidderName: data.highestBidderName,
                bidHistory: data.bidHistory,
              }
            : a
        )
      );
      if (
        selectedAuction &&
        String(selectedAuction._id) === String(data.auctionId)
      ) {
        setSelectedAuction((prev) => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          bidHistory: data.bidHistory,
        }));
      }
    };
    const onAuctionEnded = (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          String(a._id) === String(data.auctionId)
            ? { ...a, ended: true, currentBid: data.finalBid }
            : a
        )
      );
      if (
        selectedAuction &&
        String(selectedAuction._id) === String(data.auctionId)
      ) {
        setSelectedAuction((prev) => ({
          ...prev,
          ended: true,
          currentBid: data.finalBid,
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
  const currentAuction = selectedAuction
    ? auctions.find((a) => String(a._id) === String(selectedAuction._id)) ||
      selectedAuction
    : null;

  // ✅ Filtering logic — by USERNAME (as you wanted)
  const filteredAuctions = (() => {
    if (view === "all") return auctions;
    if (!user) return auctions;

    if (view === "mine") {
      return auctions.filter((a) => {
        const ownerName =
          a.owner?.username ||
          a.owner?.name ||
          (typeof a.owner === "string" ? a.owner : "");
        return ownerName === user.username;
      });
    }

    if (view === "bids") {
      return auctions.filter((a) =>
        Array.isArray(a.bidHistory)
          ? a.bidHistory.some(
              (b) => b.bidderName && b.bidderName === user.username
            )
          : false
      );
    }

    return auctions;
  })();

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800">
      {/* NAVBAR */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative">
        <h1
          onClick={() => {
            setSelectedAuction(null);
            setShowCreate(false);
            setView("all");
            setPage("home");
          }}
          className="text-2xl font-semibold tracking-tight cursor-pointer"
        >
          AuctionIT💸
        </h1>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Notifications */}
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
                onClick={() => logout() && setPage("home")}
                className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-black cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : page === "home" ? (
            <button
              onClick={() => setPage("login")}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => setPage("home")}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              View Auctions
            </button>
          )}
        </div>

        {/* Notification Panel */}
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

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto py-6">
        {!user && page === "login" && (
          <Login
            onSwitch={() => setPage("signup")}
            onLoginSuccess={() => setPage("home")}
          />
        )}
        {!user && page === "signup" && (
          <Signup
            onSwitch={() => setPage("login")}
            onSignupSuccess={() => setPage("home")}
          />
        )}

        {page === "home" && !currentAuction && !showCreate && (
          <>
            {user && (
              <div className="flex justify-between mb-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setView("all")}
                    className={`px-3 py-1 rounded ${
                      view === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setView("mine")}
                    className={`px-3 py-1 rounded ${
                      view === "mine"
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    My Auctions
                  </button>
                  <button
                    onClick={() => setView("bids")}
                    className={`px-3 py-1 rounded ${
                      view === "bids"
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    My Bids
                  </button>
                </div>

                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
                >
                  + Create Auction
                </button>
              </div>
            )}

            <AuctionList
              auctions={filteredAuctions}
              onSelect={(a) =>
                user ? setSelectedAuction(a) : setPage("login")
              }
            />
          </>
        )}

        {showCreate && user && (
          <CreateAuction
            onCreated={(created) => {
              setShowCreate(false);
              loadAuctions();
              setSelectedAuction(created);
            }}
            onBack={() => setShowCreate(false)}
          />
        )}

        {currentAuction && user && (
          <AuctionRoom
            auction={currentAuction}
            currentUser={user}
            onBack={() => setSelectedAuction(null)}
          />
        )}
      </main>
    </div>
  );
}
