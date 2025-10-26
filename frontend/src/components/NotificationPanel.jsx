export default function NotificationPanel({ notifications, onClose }) {
  return (
    <div className="w-80 right-5 bg-white shadow-lg rounded-xl border p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2 mb-3">
        <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black transition-colors cursor-pointer"
          aria-label="Close notifications"
        >
          ✖
        </button>
      </div>

      {/* Notification List */}
      {!notifications || notifications.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          No notifications yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {notifications.map((n, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-gray-100 text-sm hover:bg-gray-200 transition cursor-pointer"
            >
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
