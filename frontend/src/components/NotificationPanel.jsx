export default function NotificationPanel({ notifications, onClose }) {
  const getNotificationStyle = (type) => {
    switch (type) {
      case "AUCTION_WINNER":
        return {
          icon: "🎉",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          borderColor: "border-l-green-500",
        };
      case "AUCTION_RESULT":
        return {
          icon: "🏁",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          borderColor: "border-l-blue-500",
        };
      case "BID_PLACED":
        return {
          icon: "💰",
          bgColor: "bg-purple-50",
          textColor: "text-purple-800",
          borderColor: "border-l-purple-500",
        };
      case "OUTBID":
        return {
          icon: "😞",
          bgColor: "bg-red-50",
          textColor: "text-red-800",
          borderColor: "border-l-red-500",
        };
      case "AUCTION_ENDING_SOON":
        return {
          icon: "⏰",
          bgColor: "bg-orange-50",
          textColor: "text-orange-800",
          borderColor: "border-l-orange-500",
        };
      case "NEW_BID_SUCCESS":
        return {
          icon: "✅",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          borderColor: "border-l-green-500",
        };
      default:
        return {
          icon: "🔔",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          borderColor: "border-l-gray-500",
        };
    }
  };

  return (
    <div className="w-80 right5 bg-white shadow-xl rounded-2xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
        <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-lg"
          aria-label="Close notifications"
        >
          ✖
        </button>
      </div>

      {/* Notification List */}
      {!notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm">
          <div className="text-2xl mb-2">🔔</div>
          No notifications yet
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {notifications.map((n, i) => {
            const style = getNotificationStyle(n.type);
            return (
              <div
                key={i}
                className={`p-3 rounded-lg ${style.bgColor} ${style.textColor} hover:shadow-md transition cursor-pointer border-l-4 ${style.borderColor}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{style.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.message}</p>
                    {n.time && (
                      <p className="text-xs opacity-70 mt-1">{n.time}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
