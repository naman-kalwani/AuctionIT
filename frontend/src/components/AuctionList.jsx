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

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <h2 className="text-3xl font-semibold mb-8 text-center tracking-tight">
          🔥 Live Auctions
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <input
            type="text"
            placeholder="Search auctions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-lg bg-white shadow-sm border focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-white shadow-sm border focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Auction Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No auctions found
            </p>
          ) : (
            filtered.map((a) => (
              <div
                key={a._id}
                className={`relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl border ${
                  a.ended ? "opacity-60" : "opacity-100"
                }`}
              >
                {/* LIVE Badge */}
                {!a.ended && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    LIVE 🔴
                  </span>
                )}

                <div
                  className="w-full bg-gray-100 flex items-center justify-center overflow-hidden"
                  style={{ aspectRatio: "5/3", minHeight: "12rem" }}
                >
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      decoding="async"
                      onClick={() => setPreviewSrc(a.image)}
                      role="button"
                      aria-label={`Preview ${a.title}`}
                      className="w-full h-full object-contain cursor-pointer"
                      style={{ backgroundColor: "#f8fafc" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold">{a.title}</h3>

                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>{a.category}</span>
                    <span>
                      {a.ended
                        ? "Ended"
                        : `Ends: ${new Date(a.endAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {a.ended ? "Final Bid" : "Current Bid"}
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{(a.currentBid ?? a.basePrice).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Highest Bidder</p>
                      <p className="font-medium">
                        {a.highestBidderName || "No bids yet"}
                      </p>
                    </div>
                  </div>

                  {a.ended ? (
                    <div className="mt-3 flex gap-3 items-center">
                      <div
                        className="flex-1 flex items-center justify-center py-2 px-3 rounded-full text-white text-sm font-semibold"
                        style={{
                          background: "linear-gradient(90deg,#ef4444,#dc2626)",
                        }}
                      >
                        SOLD
                      </div>
                      {/* If the current user is the owner, allow viewing bid history */}
                      {user &&
                        (a.owner?.username
                          ? a.owner.username === user.username
                          : a.owner === user.id) && (
                          <button
                            onClick={() => setPreviewBids(a)}
                            className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded text-sm hover:bg-blue-50 shadow-sm"
                          >
                            View Bids
                          </button>
                        )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelect(a)}
                      className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
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

      {/* Image preview modal */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewSrc(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl leading-none"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewSrc(null);
            }}
            aria-label="Close preview"
          >
            ×
          </button>

          <div
            className="max-w-4xl max-h-[85vh] w-full bg-white p-4 rounded shadow-lg flex items-center justify-center"
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

      {/* Bid history modal for owners */}
      {previewBids && (
        <>
          {/* lazy import-like local component use */}
          {/** Reusable BidHistory component handles modal rendering when onClose is passed */}
          <BidHistory
            bids={previewBids.bidHistory}
            title={`Bid History — ${previewBids.title}`}
            currentBid={previewBids.currentBid}
            basePrice={previewBids.basePrice}
            ended={previewBids.ended}
            onClose={() => setPreviewBids(null)}
          />
        </>
      )}
    </>
  );
}
