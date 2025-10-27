import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api";

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6">
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: "oklch(37.9% .146 265.522)" }}
      >
        My Orders
      </h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p className="text-lg">No orders yet</p>
          <p className="text-sm mt-2">
            Your completed orders will appear here after payment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Auction Image */}
                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={order.auction.image || "https://placehold.co/300x300"}
                    alt={order.auction.title}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => navigate(`/auction/${order.auction._id}`)}
                  />
                </div>

                {/* Order Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{order.auction.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shrink-0 ml-2">
                      ✅ Paid
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Order ID:</span>{" "}
                      {order._id.slice(-8).toUpperCase()}
                    </p>
                    <p>
                      <span className="font-medium">Amount Paid:</span> ₹
                      {order.amount}
                    </p>
                    <p>
                      <span className="font-medium">Auction Ended:</span>{" "}
                      {formatDate(order.auction.endAt)}
                    </p>
                    <p>
                      <span className="font-medium">Payment Completed:</span>{" "}
                      {formatDate(order.paidAt)}
                    </p>
                    <p>
                      <span className="font-medium">Seller:</span>{" "}
                      {order.seller.username} ({order.seller.email})
                    </p>
                  </div>

                  {/* Payment Method Used */}
                  {order.paymentMethod && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-sm mb-2">
                        💳 Payment Method Used:
                      </p>
                      {order.paymentMethod.type === "UPI" ? (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">UPI:</span>{" "}
                          {order.paymentMethod.upiId}
                        </p>
                      ) : (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <span className="font-medium">Bank:</span>{" "}
                            {order.paymentMethod.bankName}
                          </p>
                          <p>
                            <span className="font-medium">Account:</span>{" "}
                            {order.paymentMethod.accountNumber}
                          </p>
                          <p>
                            <span className="font-medium">IFSC:</span>{" "}
                            {order.paymentMethod.ifscCode}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Auction Button */}
                  <button
                    onClick={() => navigate(`/auction/${order.auction._id}`)}
                    className="mt-4 px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-lg transition"
                    style={{
                      backgroundColor: "oklch(37.9% .146 265.522)",
                    }}
                  >
                    View Auction Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
      >
        ← Back
      </button>
    </div>
  );
}
