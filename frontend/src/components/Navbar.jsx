import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";

export default function Navbar({
  user,
  notifications = [],
  loadNotifications,
  markAsRead,
  markAllAsRead,
  onLogout,
  onNavigate,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
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
                <div className="fixed sm:absolute right-0 mt-3 animate-fadeSlide z-50">
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setNotifOpen(false)}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                  />
                </div>
              )}
            </div>

            {/* User Menu Dropdown (All screens) */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="userBtn"
                onClick={() => {
                  setUserMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
              >
                <span className="font-semibold text-gray-800 hidden sm:inline transition-colors [.group:hover_&]:text-[oklch(37.9%_.146_265.522)]">
                  {user.username}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {userMenuOpen && (
                <div className="fixed sm:absolute right-0 sm:right-0 mt-3 w-64 sm:w-72 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 animate-fadeSlide z-50 overflow-hidden">
                  {/* Username Header */}
                  <div className="relative px-5 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg shadow-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate text-gray-800">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate?.("/orders");
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 flex items-center gap-3 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover/item:bg-purple-200 transition-colors">
                        <span className="text-lg">📦</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">My Orders</span>
                        <p className="text-xs text-gray-500">
                          View your purchases
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate?.("/payment-options");
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center gap-3 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover/item:bg-blue-200 transition-colors">
                        <span className="text-lg">💳</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">Payment Options</span>
                        <p className="text-xs text-gray-500">
                          Manage payment methods
                        </p>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="my-2 mx-3 border-t border-gray-200"></div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 flex items-center gap-3 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover/item:bg-red-200 transition-colors">
                        <span className="text-lg">🚪</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">Logout</span>
                        <p className="text-xs text-red-400">
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
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
            className="px-3 py-1 rounded-xl transition text-white cursor-pointer"
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
