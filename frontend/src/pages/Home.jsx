import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../socket";
import { api } from "../api";
import { useAuth } from "../context/useAuth";
import { Menu, X } from "lucide-react";
import { FaPlus, FaCreditCard } from "react-icons/fa";
import { PageSkeleton, EmptyState } from "../components/ui/Loaders";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(location.state?.currentView || "all");
  const [search, setSearch] = useState(location.state?.search || "");
  const [categoryFilter, setCategoryFilter] = useState(
    location.state?.categoryFilter || ""
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadAuctions = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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

    socket.on("auction-created", (newAuction) => {
      setAuctions((prev) => [
        {
          ...newAuction,
          highestBidderName: newAuction.highestBidder?.username || null,
          bidHistory:
            newAuction.bidHistory?.map((b) => ({
              ...b,
              bidderName: b.userId?.username || "Unknown",
            })) || [],
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("bid-updated");
      socket.off("auction-ended");
      socket.off("auction-created");
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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col md:flex-row w-full bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center gap-3 bg-white shadow-md px-4 py-3 border-b border-gray-200">
        <h1
          className="text-xl font-bold shrink-0"
          style={{ color: "oklch(37.9% .146 265.522)" }}
        >
          Auctions
        </h1>
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-gray-300 text-sm focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{
            color: sidebarOpen ? "oklch(37.9% .146 265.522)" : "#374151",
          }}
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
                ? "🔥 Live Auctions"
                : tab === "mine"
                ? "🫵🏻 My Auctions"
                : tab === "bids"
                ? "💸 My Bids"
                : "📅 Past Auctions"}
            </button>
          ))}

          <div className="relative mt-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-oklch-37.9"
            />
          </div>

          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              📦
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-oklch-37.9 [&>option]:px-3"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
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
            ? "🔥Live Auctions"
            : view === "mine"
            ? "🫵🏻 My Auctions"
            : view === "bids"
            ? "💸 My Bids"
            : "📅 Past Auctions"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="No auctions to display"
                subtitle="Try adjusting filters or check back later."
                icon="🔎"
              />
            </div>
          )}

          {filteredAuctions.map((auction, idx) => {
            const timeLeft = getTimeLeft(auction.endAt);
            return (
              <div
                key={auction._id}
                className="group relative rounded-2xl overflow-hidden bg-linear-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl border border-gray-200 transition-all duration-300 hover:-translate-y-2 cursor-pointer page-transition-fast"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() =>
                  user
                    ? navigate(`/auction/${auction._id}`, {
                        state: { currentView: view, search, categoryFilter },
                      })
                    : navigate("/login")
                }
              >
                {/* Time Badge or SOLD Badge */}
                {auction.ended ? (
                  <span className="absolute top-3 right-3 px-3 py-1.5 bg-linear-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg z-10">
                    🔥 SOLD
                  </span>
                ) : (
                  <span
                    className={`absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg z-10 ${timeLeft.color}`}
                  >
                    {timeLeft.text}
                  </span>
                )}

                {/* Image */}
                <div className="bg-linear-to-br from-gray-100 to-gray-200 aspect-4/3 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={auction.image || "https://placehold.co/600x400"}
                    alt={auction.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate mb-2">
                    {auction.title}
                  </h3>

                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-linear-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-semibold text-sm mb-2">
                    {auction.category}
                  </span>

                  {/* Owner */}
                  <p className="text-xs text-gray-500 mb-3">
                    By {auction.owner?.username || "Unknown"}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3"></div>

                  {/* Price and Bidder Info */}
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                        {auction.ended ? "Final Bid" : "Current Bid"}
                      </p>
                      <p
                        className="text-2xl font-extrabold"
                        style={{ color: "oklch(37.9% .146 265.522)" }}
                      >
                        ₹
                        {(
                          auction.currentBid ?? auction.basePrice
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                    {auction.highestBidderName && (
                      <div className="text-right flex-1">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                          Top Bidder
                        </p>
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {auction.highestBidderName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Indicator */}
                  {!auction.ended && (
                    <div
                      className="mt-4 text-center py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-300 group-hover:scale-105"
                      style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
                    >
                      🎯 Click to Join
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Mobile Floating Action Buttons */}
      {/* Payment Button */}
      <button
        onClick={() => navigate("/payments")}
        className="md:hidden fixed bottom-40 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 group z-30"
        style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
        title="Payments"
      >
        <FaCreditCard className="text-2xl group-hover:scale-125 transition-transform duration-300" />
      </button>

      {/* Create Auction Button */}
      <button
        onClick={() => navigate("/create")}
        className="md:hidden fixed bottom-20 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 hover:rotate-90 transition-all duration-300 group z-30"
        style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
        title="Create Auction"
      >
        <FaPlus className="text-2xl group-hover:scale-125 transition-transform duration-300" />
      </button>
    </div>
  );
}
