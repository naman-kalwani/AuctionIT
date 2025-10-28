import { useState } from "react";

export default function NotificationPanel({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  const [filter, setFilter] = useState("unread"); // all, unread, read

  const getNotificationStyle = (type) => {
    switch (type) {
      case "AUCTION_WINNER":
        return {
          icon: "🎉",
          bgColor: "bg-linear-to-r from-green-50 to-emerald-50",
          textColor: "text-green-900",
          borderColor: "border-l-green-500",
          iconBg: "bg-green-100",
        };
      case "AUCTION_RESULT":
        return {
          icon: "🏁",
          bgColor: "bg-linear-to-r from-blue-50 to-cyan-50",
          textColor: "text-blue-900",
          borderColor: "border-l-blue-500",
          iconBg: "bg-blue-100",
        };
      case "BID_PLACED":
        return {
          icon: "💰",
          bgColor: "bg-linear-to-r from-purple-50 to-pink-50",
          textColor: "text-purple-900",
          borderColor: "border-l-purple-500",
          iconBg: "bg-purple-100",
        };
      case "OUTBID":
        return {
          icon: "😞",
          bgColor: "bg-linear-to-r from-red-50 to-orange-50",
          textColor: "text-red-900",
          borderColor: "border-l-red-500",
          iconBg: "bg-red-100",
        };
      case "AUCTION_ENDING_SOON":
        return {
          icon: "⏰",
          bgColor: "bg-linear-to-r from-orange-50 to-amber-50",
          textColor: "text-orange-900",
          borderColor: "border-l-orange-500",
          iconBg: "bg-orange-100",
        };
      case "NEW_BID_SUCCESS":
        return {
          icon: "✅",
          bgColor: "bg-linear-to-r from-green-50 to-teal-50",
          textColor: "text-green-900",
          borderColor: "border-l-green-500",
          iconBg: "bg-green-100",
        };
      default:
        return {
          icon: "🔔",
          bgColor: "bg-linear-to-r from-gray-50 to-slate-50",
          textColor: "text-gray-900",
          borderColor: "border-l-gray-500",
          iconBg: "bg-gray-100",
        };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const filteredNotifications = notifications?.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <div className="w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-linear-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <h2
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            🔔 Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-all hover:rotate-90 duration-300 cursor-pointer text-lg sm:text-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white/50"
            aria-label="Close notifications"
          >
            ✖
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-all truncate ${
              filter === "unread"
                ? "text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            style={{
              backgroundColor:
                filter === "unread" ? "oklch(37.9% .146 265.522)" : undefined,
            }}
          >
            <span className="hidden sm:inline">Unread </span>
            <span className="sm:hidden">📭 </span>(
            {notifications?.filter((n) => !n.read).length || 0})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-all truncate ${
              filter === "all"
                ? "text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            style={{
              backgroundColor:
                filter === "all" ? "oklch(37.9% .146 265.522)" : undefined,
            }}
          >
            <span className="hidden sm:inline">All </span>
            <span className="sm:hidden">📋 </span>({notifications?.length || 0})
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {!filteredNotifications || filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="text-5xl mb-3">�</div>
            <p className="text-sm font-medium">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
            <p className="text-xs mt-1 opacity-75">You're all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredNotifications.map((n, i) => {
              const style = getNotificationStyle(n.type);
              return (
                <div
                  key={n._id || i}
                  className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${
                    !n.read ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => onMarkAsRead?.(n._id)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${style.iconBg} group-hover:scale-110 transition-transform`}
                    >
                      <span className="text-lg sm:text-xl">{style.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-medium leading-relaxed ${style.textColor}`}
                      >
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatTime(n.createdAt || n.timestamp)}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        )}
                      </div>
                    </div>

                    {/* Type Badge - Hidden on mobile, visible on hover on desktop */}
                    <div
                      className={`hidden sm:block text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${style.iconBg} ${style.textColor} font-medium shrink-0 max-w-[100px] truncate`}
                    >
                      {n.type?.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              onMarkAllAsRead?.();
            }}
            className="w-full text-sm font-medium text-center py-2 rounded-lg hover:bg-gray-200 transition-colors"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
