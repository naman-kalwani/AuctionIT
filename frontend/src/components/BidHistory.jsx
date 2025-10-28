import React, { useState } from "react";

export default function BidHistory({
  bids = [],
  title = "Bid History",
  currentBid,
  basePrice,
  ended = false,
  onClose,
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const highest =
    (bids || []).reduce((m, x) => Math.max(m, x.amount || 0), 0) ||
    (currentBid ?? basePrice) ||
    0;

  const content = (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header - Clickable only on < lg screens */}
      <div
        className="p-4 flex items-center justify-between shrink-0 lg:cursor-default cursor-pointer select-none"
        style={{ backgroundColor: "oklch(37.9% .146 265.522 / 0.18)" }}
        onClick={() => window.innerWidth < 1024 && setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm opacity-80">
            {(bids || []).length} bids • Highest ₹
            {highest.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">
            ₹{((currentBid ?? basePrice) || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-xs opacity-80">
            {ended ? "Final" : "Current"}
          </div>
        </div>
      </div>

      {/* Bids List - Collapsible on < lg, always visible on lg+ */}
      <div
        className={`transition-all duration-300 lg:flex-1 lg:min-h-0 ${
          isExpanded
            ? "max-h-[60vh] opacity-100"
            : "max-h-0 opacity-0 lg:max-h-full lg:opacity-100"
        } overflow-hidden`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <div className="space-y-3">
            {(bids || [])
              .slice()
              .reverse()
              .map((b, i) => {
                const isLatest = i === 0;
                const name = b.bidderName || b.bidder || "U";
                const initials =
                  (name.match(/\b\w/g) || [])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "U";

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-3 p-3 border rounded-xl transform transition-all duration-300 
                      ${isLatest ? "bg-gray-50" : "bg-white"} 
                      border-gray-200 hover:shadow-lg
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-black"
                        style={{
                          backgroundColor: "oklch(37.9% .146 265.522 / 0.25)",
                        }}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-800">{name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(b.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{(b.amount || 0).toLocaleString("en-IN")}
                      </div>
                      {isLatest && (
                        <div className="text-xs text-gray-600 font-semibold">
                          Latest
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* {!(bids && bids.length) && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <div className="font-medium">No bids yet</div>
                <div className="text-sm">Be the first to place a bid!</div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Close Button if modal */}
      {onClose && (
        <div className="p-4 border-t text-right bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border rounded-xl hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      )}
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
