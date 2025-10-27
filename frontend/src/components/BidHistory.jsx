import React from "react";

export default function BidHistory({
  bids = [],
  title = "Bid History",
  currentBid,
  basePrice,
  ended = false,
  currentUser, // your own user info
  onClose,
  className = "",
}) {
  const highest =
    (bids || []).reduce((m, x) => Math.max(m, x.amount || 0), 0) ||
    (currentBid ?? basePrice) ||
    0;

  const content = (
    <div
      className={`h-full bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ backgroundColor: "oklch(37.9% .146 265.522 / 0.18)" }}
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

      {/* Bids List */}
      <div className="p-4 overflow-auto max-h-[60vh]">
        <div className="space-y-3">
          {(bids || [])
            .slice()
            .reverse()
            .map((b, i) => {
              const isLatest = i === 0;
              const isOwnBid = currentUser && b.bidderId === currentUser.id;
              const name = b.bidderName || b.bidder || "U";
              const initials =
                (name.match(/\b\w/g) || [])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "U";

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 p-3 border rounded-xl transform transition-all 
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-black"
                      style={{
                        backgroundColor: "oklch(37.9% .146 265.522 / 0.25)"
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <div
                        className={`font-medium ${
                          isOwnBid ? "text-green-700" : "text-gray-800"
                        }`}
                      >
                        {name} {isOwnBid && "(You)"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(b.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        isOwnBid ? "text-green-700" : "text-gray-900"
                      }`}
                    >
                      ₹{(b.amount || 0).toLocaleString("en-IN")}
                    </div>
                    {isLatest && (
                      <div className="text-xs text-green-600 font-semibold animate-pulse">
                        Latest
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {!(bids && bids.length) && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <div className="font-medium">No bids yet</div>
              <div className="text-sm">Be the first to place a bid!</div>
            </div>
          )}
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

// import React from "react";

// export default function BidHistory({
//   bids = [],
//   title = "Bid History",
//   currentBid,
//   basePrice,
//   ended = false,
//   onClose,
//   className = "",
// }) {
//   const highest =
//     (bids || []).reduce((m, x) => Math.max(m, x.amount || 0), 0) ||
//     (currentBid ?? basePrice) ||
//     0;

//   const content = (
//     <div
//       className={`h-full bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
//     >
//       {/* Header */}
//       <div
//         className="p-4 flex items-center justify-between"
//         style={{ backgroundColor: "oklch(37.9% .146 265.522 / 0.18)" }}
//       >
//         <div>
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <p className="text-sm opacity-80">
//             {(bids || []).length} bids • Highest ₹
//             {highest.toLocaleString("en-IN")}
//           </p>
//         </div>

//         <div className="text-right">
//           <div className="text-xl font-bold">
//             ₹{((currentBid ?? basePrice) || 0).toLocaleString("en-IN")}
//           </div>
//           <div className="text-xs opacity-80">
//             {ended ? "Final" : "Current"}
//           </div>
//         </div>
//       </div>

//       {/* Bids List */}
//       <div className="p-4 overflow-auto max-h-[60vh]">
//         <div className="space-y-3">
//           {(bids || [])
//             .slice()
//             .reverse()
//             .map((b, i) => {
//               const isLatest = i === 0;
//               const name = b.bidderName || b.bidder || "U";
//               const initials =
//                 (name.match(/\b\w/g) || [])
//                   .slice(0, 2)
//                   .join("")
//                   .toUpperCase() || "U";

//               return (
//                 <div
//                   key={i}
//                   className={`flex items-center justify-between gap-3 p-3 border rounded-xl hover:shadow-lg transition-all ${
//                     isLatest ? "bg-green-50" : "bg-white"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div
//                       className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-black"
//                       style={{
//                         backgroundColor: "oklch(37.9% .146 265.522 / 0.25)",
//                       }}
//                     >
//                       {initials}
//                     </div>
//                     <div className="flex flex-col">
//                       <div className="font-medium text-gray-800">{name}</div>
//                       <div className="text-xs text-gray-500">
//                         {new Date(b.timestamp).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <div className="text-sm font-semibold text-gray-900">
//                       ₹{(b.amount || 0).toLocaleString("en-IN")}
//                     </div>
//                     {isLatest && (
//                       <div className="text-xs text-green-600">Latest</div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}

//           {!(bids && bids.length) && (
//             <div className="text-center py-12 text-gray-500">
//               <div className="text-4xl mb-2">🔔</div>
//               <div className="font-medium">No bids yet</div>
//               <div className="text-sm">Be the first to place a bid!</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Close Button if modal */}
//       {onClose && (
//         <div className="p-4 border-t text-right bg-gray-50">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-white border rounded-xl hover:bg-gray-100 transition"
//           >
//             Close
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   if (onClose) {
//     return (
//       <div
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
//         onClick={onClose}
//         role="dialog"
//         aria-modal="true"
//       >
//         <button
//           className="absolute top-6 right-6 text-white text-3xl leading-none"
//           onClick={(e) => {
//             e.stopPropagation();
//             onClose();
//           }}
//           aria-label="Close bids"
//         >
//           ×
//         </button>
//         <div onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full">
//           {content}
//         </div>
//       </div>
//     );
//   }

//   return content;
// }
