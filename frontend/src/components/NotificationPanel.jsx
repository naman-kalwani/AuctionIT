export default function NotificationPanel({ notifications, onClose }) {
  return (
    <div className="w-80 right-5 bg-white shadow-xl rounded-2xl border border-gray-200 p-4">
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
          {notifications.map((n, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-gray-50 hover:bg-oklch-37.9/10 transition cursor-pointer shadow-sm"
            >
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
