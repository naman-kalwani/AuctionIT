export default function NotificationPanel({ notifications, onClose }) {
  return (
    <div className="absolute right-4 top-14 w-80 bg-white shadow-xl rounded-lg border p-3 z-50">
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-black">
          ✖
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">
          No notifications yet.
        </p>
      ) : (
        notifications.map((n, i) => (
          <div key={i} className="p-2 mb-2 rounded bg-gray-100 text-sm">
            {n.message}
          </div>
        ))
      )}
    </div>
  );
}
