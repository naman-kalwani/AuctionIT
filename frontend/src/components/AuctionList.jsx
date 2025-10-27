import { useState, useMemo } from "react";
import { useAuth } from "../context/useAuth";
import BidHistory from "./BidHistory";

export default function AuctionList({ auctions = [], onSelect }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewBids, setPreviewBids] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(auctions.map((a) => a.category).filter(Boolean));
    return ["All", ...cats];
  }, [auctions]);

  const filtered = useMemo(() => {
    return auctions
      .filter((a) => {
        const matchTitle = (a.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchCategory = category === "All" || a.category === category;
        return matchTitle && matchCategory;
      })
      .sort((a, b) =>
        a.ended === b.ended ? b.currentBid - a.currentBid : a.ended ? 1 : -1
      );
  }, [auctions, searchTerm, category]);

  const timeLeft = (endAt) => {
    const diff = new Date(endAt) - new Date();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days >= 1) return `${days}d left`;
    if (hours >= 1) return `${hours}h left`;
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m left`;
  };

  const getTimeColor = (endAt) => {
    const diff = new Date(endAt) - new Date();
    const hours = diff / (1000 * 60 * 60);
    if (hours > 24) return "bg-green-500";
    if (hours > 3) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <>
      <div className="w-full">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <input
            type="text"
            placeholder="Search auctions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-200 focus:ring-2 focus:ring-[oklch(37.9%_.146_265.522)] outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-200 focus:ring-2 focus:ring-[oklch(37.9%_.146_265.522)] outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Auction Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No auctions found
            </p>
          ) : (
            filtered.map((a) => (
              <div
                key={a._id}
                onClick={() => !a.ended && onSelect(a)}
                className={`relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl border transition-transform hover:-translate-y-1 cursor-pointer ${
                  a.ended ? "opacity-70" : "opacity-100"
                }`}
              >
                {/* Time Left */}
                {!a.ended && (
                  <span
                    className={`absolute top-2 right-2 text-white text-xs px-3 py-1 rounded-full font-semibold ${getTimeColor(
                      a.endAt
                    )}`}
                  >
                    {timeLeft(a.endAt)}
                  </span>
                )}

                {/* Image */}
                <div
                  className="bg-gray-100 flex items-center justify-center overflow-hidden"
                  style={{ aspectRatio: "4/3", minHeight: "10rem" }}
                >
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-lg">No Image</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-gray-800 truncate">
                    {a.title}
                  </h3>

                  <div className="flex justify-between text-gray-500 text-sm font-semibold">
                    <span>{a.category}</span>
                    <span>
                      {a.ended
                        ? "Ended"
                        : new Date(a.endAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">
                        {a.ended ? "Final Bid" : "Current Bid"}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800">
                        ₹{(a.currentBid ?? a.basePrice).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-semibold">
                        Highest Bidder
                      </p>
                      <p className="font-bold text-gray-800">
                        {a.highestBidderName || "No bids yet"}
                      </p>
                    </div>
                  </div>

                  {a.ended ? (
                    <div className="mt-3 flex gap-3 items-center">
                      <div className="flex-1 flex items-center justify-center py-2 px-3 rounded-full text-white text-sm font-semibold bg-red-600">
                        SOLD
                      </div>
                      {user &&
                        (a.owner?.username === user.username ||
                          a.owner === user.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewBids(a);
                            }}
                            className="px-3 py-2 border rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50"
                            style={{
                              borderColor: "oklch(37.9% .146 265.522)",
                              color: "oklch(37.9% .146 265.522)",
                            }}
                          >
                            View Bids
                          </button>
                        )}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(a);
                      }}
                      className="mt-3 w-full py-2 rounded-lg transition font-semibold shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: "oklch(37.9% .146 265.522)",
                        color: "white",
                      }}
                    >
                      Join Auction
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewSrc(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewSrc(null);
            }}
          >
            ×
          </button>
          <div
            className="max-w-4xl max-h-[85vh] bg-white p-4 rounded-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewSrc}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Bid History Modal */}
      {previewBids && (
        <BidHistory
          bids={previewBids.bidHistory}
          title={`Bid History — ${previewBids.title}`}
          currentBid={previewBids.currentBid}
          basePrice={previewBids.basePrice}
          ended={previewBids.ended}
          onClose={() => setPreviewBids(null)}
        />
      )}
    </>
  );
}
