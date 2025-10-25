// src/components/AuctionList.jsx
import { useState, useMemo } from "react";

export default function AuctionList({ auctions = [], onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(auctions.map((a) => a.category).filter(Boolean));
    return ["All", ...cats];
  }, [auctions]);

  const filtered = useMemo(() => {
    return auctions.filter((a) => {
      const matchTitle = (a.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory = category === "All" || a.category === category;
      return matchTitle && matchCategory;
    });
  }, [auctions, searchTerm, category]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Live Auctions</h2>

      <div className="flex flex-col md:flex-row gap-3 mb-6 justify-between items-center">
        <input
          className="border rounded px-3 py-2 w-full md:w-1/2 focus:ring-2 focus:ring-blue-400"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 w-full">No auctions found.</p>
        ) : (
          filtered.map((a) =>
            a._id ? (
              <div
                key={a._id}
                className={`border rounded-lg shadow p-4 flex flex-col justify-between transition-opacity ${
                  a.ended ? "opacity-50" : "opacity-100"
                }`}
              >
                {a.image ? (
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded mb-3 text-gray-400">
                    No image
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-1">{a.title}</h3>
                {a.category && (
                  <span className="text-sm text-gray-500 mb-2">
                    Category: {a.category}
                  </span>
                )}
                <p className="text-gray-600 mb-4">
                  Current Bid:{" "}
                  <span className="font-bold">
                    ₹{(a.currentBid ?? a.basePrice).toLocaleString("en-IN")}
                  </span>
                </p>

                {a.ended ? (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm mb-2 self-start">
                    Sold
                  </span>
                ) : (
                  <button
                    onClick={() => onSelect(a)}
                    className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Join Auction
                  </button>
                )}
              </div>
            ) : null
          )
        )}
      </div>
    </div>
  );
}
