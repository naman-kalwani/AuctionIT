import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api";
import { InlineLoader, EmptyState } from "../components/ui/Loaders";

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending"); // pending or received
  const [pendingPayments, setPendingPayments] = useState([]);
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/payments", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPendingPayments(data.pending || []);
      setReceivedPayments(data.received || []);
    } catch (err) {
      console.error("Error loading payments:", err);
      setMessage("❌ Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsPaid = async (auctionId) => {
    if (!confirm("Confirm that you have completed the payment?")) return;

    try {
      await api.post(
        `/api/payments/${auctionId}/mark-paid`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setMessage("✅ Payment marked as completed!");
      loadPayments();
    } catch (err) {
      console.error("Error marking payment:", err);
      setMessage("❌ Failed to mark payment as completed");
    }
  };

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
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
      >
        ← Back
      </button>
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: "oklch(37.9% .146 265.522)" }}
      >
        Payments
      </h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl text-center ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "pending"
              ? "border-b-2 text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
          style={{
            borderColor:
              activeTab === "pending"
                ? "oklch(37.9% .146 265.522)"
                : "transparent",
            color:
              activeTab === "pending" ? "oklch(37.9% .146 265.522)" : undefined,
          }}
        >
          Pending Payments ({pendingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "received"
              ? "border-b-2"
              : "text-gray-600 hover:text-gray-800"
          }`}
          style={{
            borderColor:
              activeTab === "received"
                ? "oklch(37.9% .146 265.522)"
                : "transparent",
            color:
              activeTab === "received"
                ? "oklch(37.9% .146 265.522)"
                : undefined,
          }}
        >
          Payment Received ({receivedPayments.length})
        </button>
      </div>

      {/* Fixed height container to prevent layout shift */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <InlineLoader text="Loading payments..." />
          </div>
        ) : (
          <>
            {/* Pending Payments Tab */}
            {activeTab === "pending" && (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {pendingPayments.length === 0 ? (
                  <EmptyState
                    title="No pending payments"
                    subtitle="You don't have any auctions to pay for at the moment."
                    icon="💳"
                  />
                ) : (
                  <div className="grid gap-4">
                    {pendingPayments.map((payment, idx) => (
                      <div
                        key={payment.auction._id}
                        className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 page-transition-fast relative overflow-hidden group"
                        style={{ animationDelay: `${idx * 0.08}s` }}
                      >
                        {/* Decorative gradient background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-100 to-red-100 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                          {/* Auction Image */}
                          <div className="w-full sm:w-36 h-36 bg-linear-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden shrink-0 border-2 border-gray-200 transition-colors shadow-md">
                            <img
                              src={
                                payment.auction.image ||
                                "https://placehold.co/300x300"
                              }
                              alt={payment.auction.title}
                              className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Auction Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-bold text-lg sm:text-xl text-gray-800  transition-colors">
                                {payment.auction.title}
                              </h3>
                              <span className="px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ml-2 shadow-sm border border-orange-200">
                                ⏳ Pending
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                              <p className="flex items-center gap-2">
                                <span className="text-green-500">💰</span>
                                <span className="font-medium">
                                  Won At:
                                </span>{" "}
                                <span
                                  className="font-bold"
                                  style={{ color: "oklch(37.9% .146 265.522)" }}
                                >
                                  ₹{payment.amount.toLocaleString("en-IN")}
                                </span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-orange-500">🏁</span>
                                <span className="font-medium">Ended:</span>{" "}
                                {formatDate(payment.auction.endAt)}
                              </p>
                              <p className="flex items-center gap-2 sm:col-span-2">
                                <span className="text-purple-500">👤</span>
                                <span className="font-medium">
                                  Seller:
                                </span>{" "}
                                <span className="font-semibold">
                                  {payment.seller.username}
                                </span>
                                <span className="text-gray-400">
                                  ({payment.seller.email})
                                </span>
                              </p>
                            </div>

                            {/* Payment Method Info */}
                            {payment.paymentMethod && (
                              <div className="mt-4 p-3 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-400 shadow-sm">
                                <p className="font-bold text-sm mb-2 text-blue-900">
                                  💳 Payment Details
                                </p>
                                {payment.paymentMethod.type === "UPI" ? (
                                  <p className="text-sm text-blue-800">
                                    <span className="font-medium">UPI ID:</span>{" "}
                                    <span className="font-mono bg-white px-2 py-0.5 rounded">
                                      {payment.paymentMethod.upiId}
                                    </span>
                                  </p>
                                ) : (
                                  <div className="text-sm text-blue-800 space-y-1">
                                    <p>
                                      <span className="font-medium">Bank:</span>{" "}
                                      {payment.paymentMethod.bankName}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Account:
                                      </span>{" "}
                                      <span className="font-mono">
                                        {payment.paymentMethod.accountNumber}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium">IFSC:</span>{" "}
                                      <span className="font-mono">
                                        {payment.paymentMethod.ifscCode}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium">Name:</span>{" "}
                                      {payment.paymentMethod.accountHolderName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Button */}
                            <button
                              onClick={() =>
                                handleMarkAsPaid(payment.auction._id)
                              }
                              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn"
                              style={{
                                backgroundColor: "oklch(37.9% .146 265.522)",
                              }}
                            >
                              <span className="flex items-center gap-2">
                                Pay Now
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
                )}
              </div>
            )}

            {/* Received Payments Tab */}
            {activeTab === "received" && (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {receivedPayments.length === 0 ? (
                  <EmptyState
                    title="No payments received"
                    subtitle="You haven't received any payments for your auctions yet."
                    icon="📥"
                  />
                ) : (
                  <div className="grid gap-4">
                    {receivedPayments.map((payment, idx) => (
                      <div
                        key={payment.auction._id}
                        className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 page-transition-fast relative overflow-hidden group"
                        style={{ animationDelay: `${idx * 0.08}s` }}
                      >
                        {/* Decorative gradient background */}
                        <div
                          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${
                            payment.status === "paid"
                              ? "bg-linear-to-br from-green-100 to-emerald-100"
                              : "bg-linear-to-br from-yellow-100 to-orange-100"
                          }`}
                        ></div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                          {/* Auction Image */}
                          <div
                            className={`w-full sm:w-36 h-36 bg-linear-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden shrink-0 border-2 border-gray-200 transition-colors shadow-md ${
                              payment.status === "paid"
                                ? "group-hover:border-green-300"
                                : "group-hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={
                                payment.auction.image ||
                                "https://placehold.co/300x300"
                              }
                              alt={payment.auction.title}
                              className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Auction Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3
                                className={`font-bold text-lg sm:text-xl text-gray-800 transition-colors ${
                                  payment.status === "paid"
                                    ? "group-hover:text-green-600"
                                    : "group-hover:text-gray-900"
                                }`}
                              >
                                {payment.auction.title}
                              </h3>
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ml-2 shadow-sm border ${
                                  payment.status === "paid"
                                    ? "bg-linear-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                                    : "bg-linear-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                {payment.status === "paid"
                                  ? "✅ Paid"
                                  : "⏳ Pending"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                              <p className="flex items-center gap-2">
                                <span className="text-green-500">💰</span>
                                <span className="font-medium">
                                  Sold At:
                                </span>{" "}
                                <span
                                  className="font-bold"
                                  style={{ color: "oklch(37.9% .146 265.522)" }}
                                >
                                  ₹{payment.amount.toLocaleString("en-IN")}
                                </span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-orange-500">🏁</span>
                                <span className="font-medium">Ended:</span>{" "}
                                {formatDate(payment.auction.endAt)}
                              </p>
                              <p className="flex items-center gap-2 sm:col-span-2">
                                <span className="text-purple-500">👤</span>
                                <span className="font-medium">
                                  Winner:
                                </span>{" "}
                                <span className="font-semibold">
                                  {payment.buyer.username}
                                </span>
                                <span className="text-gray-400">
                                  ({payment.buyer.email})
                                </span>
                              </p>
                              {payment.paidAt && (
                                <p className="flex items-center gap-2 sm:col-span-2">
                                  <span className="text-blue-500">✅</span>
                                  <span className="font-medium">
                                    Paid On:
                                  </span>{" "}
                                  {formatDate(payment.paidAt)}
                                </p>
                              )}
                            </div>

                            {payment.status === "pending" && (
                              <div className="mt-3 p-3 bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400 shadow-sm">
                                <p className="text-sm text-yellow-800 font-semibold flex items-center gap-2">
                                  <span className="animate-pulse">⏳</span>
                                  Waiting for buyer to complete payment
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
