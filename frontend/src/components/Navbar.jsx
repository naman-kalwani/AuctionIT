import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";

export default function Navbar({
  user,
  notifications = [],
  loadNotifications,
  onLogout,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.length;
  const btnRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (open) loadNotifications?.();
  }, [open, loadNotifications]);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative">
      <h1
        onClick={() => onNavigate?.("/")}
        className="text-2xl font-semibold tracking-tight cursor-pointer"
      >
        AuctionIT💸
      </h1>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <div className="relative">
              <button
                ref={btnRef}
                aria-haspopup="true"
                aria-expanded={open}
                className="relative btn-reset"
                onClick={() => setOpen((v) => !v)}
                title="Notifications"
              >
                <span className="text-2xl cursor-pointer">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                    {unread}
                  </span>
                )}
              </button>

              <div
                className={`fixed top-16 right-10 z-50 w-80 transition-transform duration-200 origin-top-right ${
                  open
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0 pointer-events-none"
                }`}
              >
                {open && (
                  <div className="card p-2">
                    <NotificationPanel
                      notifications={notifications}
                      onClose={() => setOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <span className="font-medium">{user.username} 👤</span>
            <button
              onClick={onLogout}
              className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-black cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              const path = location?.pathname || "";
              if (path === "/login" || path === "/signup") onNavigate?.("/");
              else onNavigate?.("/login");
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            {(() => {
              const path = location?.pathname || "";
              return path === "/" ? "Login / Signup" : "View Auctions";
            })()}
          </button>
        )}
      </div>
    </header>
  );
}
