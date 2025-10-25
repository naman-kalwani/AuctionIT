// src/components/CreateAuction.jsx
import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/useAuth";

export default function CreateAuction({ onCreated, onBack }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    category: "Electronics",
    description: "",
    basePrice: "",
    durationMinutes: 10,
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const categories = [
    "Furniture & Essentials",
    "Study & Electronics",
    "Kitchen & Appliances",
    "Personal & Miscellaneous",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setMessage("⚠️ Please login before creating an auction.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));

      const res = await api.post("/api/auctions", fd);
      setMessage("✅ Auction created.");
      setForm({
        title: "",
        category: "Electronics",
        description: "",
        basePrice: "",
        durationMinutes: 10,
        imageFile: null,
      });
      onCreated && onCreated(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating auction. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded shadow bg-white mt-6">
      <h2 className="text-2xl font-bold mb-4">Create Auction</h2>
      {message && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="border rounded px-3 py-2"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border rounded px-3 py-2"
        />
        <input
          name="basePrice"
          type="number"
          value={form.basePrice}
          onChange={handleChange}
          placeholder="Base Price"
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="durationMinutes"
          type="number"
          value={form.durationMinutes}
          onChange={handleChange}
          placeholder="Duration (minutes)"
          className="border rounded px-3 py-2"
        />
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Creating..." : "Create Auction"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Back
          </button>
        </div>
      </form>
    </div>
  );
}
