import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api";
import { InlineLoader, EmptyState } from "../components/ui/Loaders";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/orders", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6 mb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition shadow-sm hover:shadow-md"
      >
        ← Back
      </button>

      <h1
        className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2"
        style={{ color: "oklch(37.9% .146 265.522)" }}
      >
        📦 My Orders
      </h1>

      {/* Fixed height container to prevent layout shift */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <InlineLoader text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            subtitle="Your completed orders will appear here after payment."
            icon="📦"
          />
        ) : (
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            <div className="grid gap-4">
              {orders.map((order, idx) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 page-transition-fast relative overflow-hidden group"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Decorative gradient background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    {/* Auction Image */}
                    <div className="w-full sm:w-36 h-36 bg-linear-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden shrink-0 border-2 border-gray-200 group-hover:border-purple-300 transition-colors shadow-md">
                      <img
                        src={
                          order.auction.image || "https://placehold.co/300x300"
                        }
                        alt={order.auction.title}
                        className="w-full h-full object-contain cursor-pointer hover:scale-110 transition-transform duration-300"
                        onClick={() =>
                          navigate(`/auction/${order.auction._id}`)
                        }
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-800  transition-colors">
                          {order.auction.title}
                        </h3>
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-linear-to-r from-green-100 to-emerald-100 text-green-700 shrink-0 ml-2 shadow-sm border border-green-200">
                          ✅ Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <p className="flex items-center gap-2">
                          <span className="text-purple-500">🆔</span>
                          <span className="font-medium">Order:</span>{" "}
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {order._id.slice(-8).toUpperCase()}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">💰</span>
                          <span className="font-medium">Amount:</span>{" "}
                          <span
                            className="font-bold"
                            style={{ color: "oklch(37.9% .146 265.522)" }}
                          >
                            ₹{order.amount.toLocaleString("en-IN")}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-orange-500">🏁</span>
                          <span className="font-medium">Ended:</span>{" "}
                          {formatDate(order.auction.endAt)}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-blue-500">✅</span>
                          <span className="font-medium">Paid:</span>{" "}
                          {formatDate(order.paidAt)}
                        </p>
                        <p className="flex items-center gap-2 sm:col-span-2">
                          <span className="text-purple-500">👤</span>
                          <span className="font-medium">Seller:</span>{" "}
                          <span className="font-semibold">
                            {order.seller.username}
                          </span>
                          <span className="text-gray-400">
                            ({order.seller.email})
                          </span>
                        </p>
                      </div>

                      {/* Payment Method Used */}
                      {order.paymentMethod && (
                        <div className="mt-4 p-3 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-400 shadow-sm">
                          <p className="font-bold text-sm mb-2 text-blue-900">
                            💳 Payment Method Used
                          </p>
                          {order.paymentMethod.type === "UPI" ? (
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">UPI:</span>{" "}
                              <span className="font-mono bg-white px-2 py-0.5 rounded">
                                {order.paymentMethod.upiId}
                              </span>
                            </p>
                          ) : (
                            <div className="text-sm text-blue-800 space-y-1">
                              <p>
                                <span className="font-medium">Bank:</span>{" "}
                                {order.paymentMethod.bankName}
                              </p>
                              <p>
                                <span className="font-medium">Account:</span>{" "}
                                <span className="font-mono">
                                  {order.paymentMethod.accountNumber}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">IFSC:</span>{" "}
                                <span className="font-mono">
                                  {order.paymentMethod.ifscCode}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* View Auction Button */}
                      <button
                        onClick={() =>
                          navigate(`/auction/${order.auction._id}`)
                        }
                        className="mt-4 px-5 py-2.5 rounded-xl font-bold text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn"
                        style={{
                          backgroundColor: "oklch(37.9% .146 265.522)",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          View Auction Details
                          <span className="group-hover/btn:translate-x-1 transition-transform">
                            →
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
