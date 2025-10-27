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
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = notifications.length;
  const location = useLocation();

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (notifOpen) loadNotifications?.();
  }, [notifOpen, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        !e.target.closest("#notifBtn")
      ) {
        setNotifOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        !e.target.closest("#userBtn")
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-5 py-3 bg-white/80 backdrop-blur-md shadow-md">
      {/* Logo */}
      <h1
        onClick={() => onNavigate?.("/")}
        className="text-2xl font-bold tracking-tight cursor-pointer select-none"
      >
        AuctionIT💸
      </h1>

      <div className="flex items-center gap-3 sm:gap-5">
        {user ? (
          <>
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                id="notifBtn"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserMenuOpen(false);
                }}
                className="relative text-2xl hover:text-gray-700 transition cursor-pointer"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1.5 rounded-full">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg animate-fadeSlide z-50">
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setNotifOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Desktop user info */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="font-medium text-gray-800">
                {user.username} 👤
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1 rounded-xl text-white hover:opacity-90 transition cursor-pointer"
                style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
              >
                Logout
              </button>
            </div>

            {/* Mobile dropdown */}
            <div className="relative sm:hidden" ref={userMenuRef}>
              <button
                id="userBtn"
                onClick={() => {
                  setUserMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="text-2xl hover:text-gray-700 transition cursor-pointer"
              >
                👤
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg animate-fadeSlide z-50">
                  <div className="p-3 text-gray-800 font-semibold text-center">
                    {user.username}
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-center py-2 text-red-600 hover:bg-red-100/30 transition rounded-b-2xl"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => {
              const path = location?.pathname || "";
              if (path === "/login" || path === "/signup") onNavigate?.("/");
              else onNavigate?.("/login");
            }}
            className="px-3 py-1 rounded-xl transition text-white"
            style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
          >
            {location?.pathname === "/" ? "Login / Signup" : "Home"}
          </button>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeSlide {
          animation: fadeSlide 0.25s ease-out;
        }
      `}</style>
    </header>
  );
}
