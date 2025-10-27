import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api";

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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Pending Payments Tab */}
          {activeTab === "pending" && (
            <div>
              {pendingPayments.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                  <p className="text-lg">No pending payments</p>
                  <p className="text-sm mt-2">
                    You don't have any auctions to pay for at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingPayments.map((payment) => (
                    <div
                      key={payment.auction._id}
                      className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Auction Image */}
                        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={
                              payment.auction.image ||
                              "https://placehold.co/300x300"
                            }
                            alt={payment.auction.title}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Auction Details */}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {payment.auction.title}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Won At:</span> ₹
                              {payment.amount}
                            </p>
                            <p>
                              <span className="font-medium">Ended:</span>{" "}
                              {formatDate(payment.auction.endAt)}
                            </p>
                            <p>
                              <span className="font-medium">Seller:</span>{" "}
                              {payment.seller.username} ({payment.seller.email})
                            </p>
                          </div>

                          {/* Payment Method Info */}
                          {payment.paymentMethod && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="font-semibold text-sm mb-2">
                                💳 Payment Details:
                              </p>
                              {payment.paymentMethod.type === "UPI" ? (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">UPI ID:</span>{" "}
                                  {payment.paymentMethod.upiId}
                                </p>
                              ) : (
                                <div className="text-sm text-gray-700 space-y-1">
                                  <p>
                                    <span className="font-medium">Bank:</span>{" "}
                                    {payment.paymentMethod.bankName}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Account:
                                    </span>{" "}
                                    {payment.paymentMethod.accountNumber}
                                  </p>
                                  <p>
                                    <span className="font-medium">IFSC:</span>{" "}
                                    {payment.paymentMethod.ifscCode}
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
                            className="mt-4 px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-lg transition"
                            style={{
                              backgroundColor: "oklch(37.9% .146 265.522)",
                            }}
                          >
                            Mark as Paid
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
            <div>
              {receivedPayments.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                  <p className="text-lg">No payments received</p>
                  <p className="text-sm mt-2">
                    You haven't received any payments for your auctions yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {receivedPayments.map((payment) => (
                    <div
                      key={payment.auction._id}
                      className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Auction Image */}
                        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={
                              payment.auction.image ||
                              "https://placehold.co/300x300"
                            }
                            alt={payment.auction.title}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Auction Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-lg mb-2">
                              {payment.auction.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                payment.status === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {payment.status === "paid"
                                ? "✅ Paid"
                                : "⏳ Pending"}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Sold At:</span> ₹
                              {payment.amount}
                            </p>
                            <p>
                              <span className="font-medium">Ended:</span>{" "}
                              {formatDate(payment.auction.endAt)}
                            </p>
                            <p>
                              <span className="font-medium">Winner:</span>{" "}
                              {payment.buyer.username} ({payment.buyer.email})
                            </p>
                            {payment.paidAt && (
                              <p>
                                <span className="font-medium">Paid On:</span>{" "}
                                {formatDate(payment.paidAt)}
                              </p>
                            )}
                          </div>

                          {payment.status === "pending" && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm text-yellow-800">
                                ⏳ Waiting for buyer to complete payment
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
