import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../socket";
import { api } from "../api";
import { useAuth } from "../context/useAuth";
import { Menu, X } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [auctions, setAuctions] = useState([]);
  const [view, setView] = useState(location.state?.currentView || "all");
  const [search, setSearch] = useState(location.state?.search || "");
  const [categoryFilter, setCategoryFilter] = useState(
    location.state?.categoryFilter || ""
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const categories = [
    ...new Set(auctions.map((a) => a.category).filter(Boolean)),
  ];

  const filteredAuctions = auctions
    .filter((a) => {
      if (view === "all") return !a.ended;
      if (view === "past") return a.ended;
      if (view === "mine") return a.owner?.username === user?.username;
      if (view === "bids")
        return a.bidHistory?.some((b) => b.bidderName === user?.username);
      return true;
    })
    .filter(
      (a) => !search || a.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((a) => !categoryFilter || a.category === categoryFilter)
    .sort((a, b) =>
      view === "past" ? new Date(b.endAt) - new Date(a.endAt) : 0
    );

  const getTimeLeft = (endAt) => {
    const diff = new Date(endAt) - new Date();
    if (diff <= 0) return { text: "Ended", color: "bg-gray-400" };
    const h = Math.floor(diff / (1000 * 60 * 60));
    if (h >= 24)
      return { text: `${Math.floor(h / 24)}d`, color: "bg-green-500" };
    if (h > 2) return { text: `${h}h`, color: "bg-orange-500" };
    return { text: `${h}h`, color: "bg-red-500" };
  };

  return (
    <div className="flex flex-col md:flex-row w-full bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center bg-white shadow px-4 py-3">
        <h1
          className="text-xl font-bold"
          style={{ color: "oklch(37.9% .146 265.522)" }}
        >
          Auctions
        </h1>
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="text-gray-700 hover:text-black"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed  md:sticky md:top-16 z-20 top-0 left-0 w-64 bg-white shadow-lg p-6 flex flex-col gap-4 h-screen md:h-[calc(100vh-4rem)] overflow-hidden transition-transform duration-300`}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "oklch(37.9% .146 265.522)" }}
        >
          Filters
        </h2>

        <div className="flex flex-col gap-2 mt-2">
          {["all", "mine", "bids", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setView(tab);
                setSidebarOpen(false);
              }}
              className={`text-left px-4 py-2 rounded-lg font-medium transition-all ${
                view === tab
                  ? "text-white shadow"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor:
                  view === tab ? "oklch(37.9% .146 265.522)" : undefined,
              }}
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

          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-oklch-37.9"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-oklch-37.9"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            navigate("/payments");
            setSidebarOpen(false);
          }}
          className="mt-auto text-white px-4 py-2 rounded-lg font-semibold shadow hover:shadow-lg transition"
          style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
        >
          💳 Payments
        </button>

        <button
          onClick={() => {
            navigate("/create");
            setSidebarOpen(false);
          }}
          className="mb-4 text-white px-4 py-2 rounded-lg font-semibold shadow hover:shadow-lg transition"
          style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
        >
          + Create Auction
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 mt-2 md:mt-0 overflow-y-auto h-screen md:h-[calc(100vh-4rem)]">
        <h1
          className="text-2xl md:text-3xl font-bold mb-5"
          style={{ color: "oklch(37.9% .146 265.522)" }}
        >
          {view === "all"
            ? "Live Auctions"
            : view === "mine"
            ? "My Auctions"
            : view === "bids"
            ? "My Bids"
            : "Past Auctions"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              No auctions to display.
            </p>
          )}

          {filteredAuctions.map((auction) => {
            const timeLeft = getTimeLeft(auction.endAt);
            return (
              <div
                key={auction._id}
                className="bg-white shadow-md hover:shadow-xl rounded-xl overflow-hidden relative cursor-pointer transition-transform hover:-translate-y-1"
                onClick={() =>
                  user
                    ? navigate(`/auction/${auction._id}`, {
                        state: { currentView: view, search, categoryFilter },
                      })
                    : navigate("/login")
                }
              >
                <div className="relative bg-gray-100 aspect-4/3 flex justify-center items-center">
                  <img
                    src={auction.image || "https://placehold.co/600x400"}
                    alt={auction.title}
                    className="w-full h-full object-contain p-2"
                  />
                  {!auction.ended && (
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${timeLeft.color}`}
                    >
                      {timeLeft.text}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg truncate mb-1">
                    {auction.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {auction.category}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    By {auction.owner?.username || "Unknown"}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">
                      ₹{auction.currentBid ?? auction.basePrice}
                    </span>
                    {auction.highestBidderName && (
                      <span className="text-gray-500 truncate">
                        {auction.highestBidderName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => navigate("/create")}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl font-bold hover:scale-110 transition-transform z-30"
        style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
        title="Create Auction"
      >
        +
      </button>
    </div>
  );
}
