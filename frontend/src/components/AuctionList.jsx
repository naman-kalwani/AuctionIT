import { useState, useMemo } from "react";

export default function AuctionList({ auctions = [], onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [previewSrc, setPreviewSrc] = useState(null);

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

                {/* Image: fixed aspect container to avoid layout shifts for dynamic image sizes; use object-contain so the full image is visible */}
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
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{a.title}</h3>

                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>{a.category}</span>
                    <span>
                      {a.ended
                        ? "Ended"
                        : `Ends: ${new Date(a.endAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  <p className="text-gray-700 mt-2">
                    {a.ended ? "Final Bid: " : "Current Bid: "}
                    <span className="font-bold text-gray-900">
                      ₹{(a.currentBid ?? a.basePrice).toLocaleString("en-IN")}
                    </span>
                  </p>

                  {/* Join or Ended */}
                  {a.ended ? (
                    <div className="mt-3 w-full py-2 text-center bg-red-500 text-white rounded text-sm">
                      SOLD
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
    </>
  );
}
