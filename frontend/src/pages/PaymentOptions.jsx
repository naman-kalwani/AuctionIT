import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api";

export default function PaymentOptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState("");
  const [newMethod, setNewMethod] = useState({
    type: "UPI",
    upiId: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });

  const loadPaymentMethods = async () => {
    try {
      const { data } = await api.get("/api/payment-methods", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPaymentMethods(data);
    } catch (err) {
      console.error("Error loading payment methods:", err);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMethod = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/api/payment-methods", newMethod, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessage("✅ Payment method added successfully!");
      setIsAddingNew(false);
      setNewMethod({
        type: "UPI",
        upiId: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
      });
      loadPaymentMethods();
    } catch (err) {
      console.error("Error adding payment method:", err);
      setMessage("❌ Error adding payment method. Try again.");
    }
  };

  const handleDeleteMethod = async (methodId) => {
    if (!confirm("Are you sure you want to delete this payment method?"))
      return;

    try {
      await api.delete(`/api/payment-methods/${methodId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessage("✅ Payment method deleted successfully!");
      loadPaymentMethods();
    } catch (err) {
      console.error("Error deleting payment method:", err);
      setMessage("❌ Error deleting payment method.");
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await api.patch(
        `/api/payment-methods/${methodId}/set-default`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setMessage("✅ Default payment method updated!");
      loadPaymentMethods();
    } catch (err) {
      console.error("Error setting default:", err);
      setMessage("❌ Error updating default payment method.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6">
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: "oklch(37.9% .146 265.522)" }}
      >
        Payment Options
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

      {/* Existing Payment Methods */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Payment Methods</h2>
        {paymentMethods.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            <p>No payment methods added yet.</p>
            <p className="text-sm mt-2">
              Add a payment method to receive payments for your auction wins.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method._id}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-200 relative"
              >
                {method.isDefault && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}

                <div className="mb-3">
                  <h3 className="font-bold text-lg">{method.type}</h3>
                </div>

                {method.type === "UPI" ? (
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">UPI ID:</span>{" "}
                      {method.upiId}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      <span className="font-medium">Bank:</span>{" "}
                      {method.bankName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Account:</span>{" "}
                      {method.accountNumber}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">IFSC:</span>{" "}
                      {method.ifscCode}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Name:</span>{" "}
                      {method.accountHolderName}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method._id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMethod(method._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Payment Method */}
      {!isAddingNew ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsAddingNew(true)}
            className="w-full sm:w-3/4 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition"
            style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
          >
            + Add Payment Method
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-1/4 py-3 rounded-xl font-semibold text-black shadow-lg hover:shadow-xl transition bg-gray-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Payment Method</h2>

          <form onSubmit={handleAddMethod} className="space-y-4">
            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Type
              </label>
              <select
                value={newMethod.type}
                onChange={(e) =>
                  setNewMethod({ ...newMethod, type: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Account">Bank Account</option>
              </select>
            </div>

            {newMethod.type === "UPI" ? (
              <div>
                <label className="block text-sm font-medium mb-2">
                  UPI ID *
                </label>
                <input
                  type="text"
                  value={newMethod.upiId}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, upiId: e.target.value })
                  }
                  placeholder="yourname@upi"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={newMethod.bankName}
                    onChange={(e) =>
                      setNewMethod({ ...newMethod, bankName: e.target.value })
                    }
                    placeholder="e.g., HDFC Bank"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={newMethod.accountNumber}
                    onChange={(e) =>
                      setNewMethod({
                        ...newMethod,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="1234567890"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={newMethod.ifscCode}
                    onChange={(e) =>
                      setNewMethod({ ...newMethod, ifscCode: e.target.value })
                    }
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={newMethod.accountHolderName}
                    onChange={(e) =>
                      setNewMethod({
                        ...newMethod,
                        accountHolderName: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition"
                style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
              >
                Save Payment Method
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setMessage("");
                }}
                className="flex-1 py-2 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
