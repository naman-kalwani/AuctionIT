import React from "react";

export default function BidHistory({
  bids = [],
  title = "Bid History",
  currentBid,
  basePrice,
  ended = false,
  onClose, // if provided, render as modal with overlay and close button
  className = "",
}) {
  const highest =
    (bids || []).reduce((m, x) => Math.max(m, x.amount || 0), 0) ||
    (currentBid ?? basePrice) ||
    0;

  const content = (
    <div
      className={`w-full bg-white rounded shadow-lg overflow-hidden ${className}`}
    >
      <div className="p-4 bg-blue-200 text-black flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm opacity-90">
            {(bids || []).length} bids • Highest ₹
            {highest.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">
            ₹{((currentBid ?? basePrice) || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-xs opacity-90">
            {ended ? "Final" : "Current"}
          </div>
        </div>
      </div>

      <div className="p-4 overflow-auto max-h-[60vh]">
        <div className="space-y-3">
          {(bids || [])
            .slice()
            .reverse()
            .map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:shadow transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-black font-semibold">
                    {(() => {
                      const name = b.bidderName || b.bidder || "U";
                      const initials = (name.match(/\b\w/g) || [])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return initials || "U";
                    })()}
                  </div>

                  <div>
                    <div className="font-medium">
                      {b.bidderName || b.bidder || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(b.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold">
                    ₹{(b.amount || 0).toLocaleString("en-IN")}
                  </div>
                  {i === 0 && (
                    <div className="text-xs text-green-600">Latest</div>
                  )}
                </div>
              </div>
            ))}

          {!(bids && bids.length) && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">🔔</div>
              <div className="font-medium">No bids yet</div>
              <div className="text-sm">
                Be the first to place a bid on this auction.
              </div>
            </div>
          )}
        </div>
      </div>

      {onClose ? (
        <div className="p-4 border-t text-right bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute top-6 right-6 text-white text-3xl leading-none"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close bids"
        >
          ×
        </button>
        <div onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
