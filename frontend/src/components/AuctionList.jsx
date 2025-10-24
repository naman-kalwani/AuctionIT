// src/components/AuctionList.jsx
import React from "react";

export default function AuctionList({ auctions = [], onSelect }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Live Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctions.map((a) => (
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

            <h3 className="text-xl font-semibold mb-2">{a.title}</h3>
            <p className="text-gray-600 mb-4">
              Current Bid:{" "}
              <span className="font-bold">
                ₹{(a.currentBid ?? a.basePrice).toLocaleString("en-IN")}
              </span>
            </p>

            {a.ended && (
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm mb-2 self-start">
                Sold
              </span>
            )}

            {!a.ended && (
              <button
                onClick={() => onSelect(a)}
                className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Join Auction
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
