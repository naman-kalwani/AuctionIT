// src/components/CreateAuction.jsx
import { useState, useRef } from "react";
import { api } from "../api";
import { useAuth } from "../context/useAuth";

export default function CreateAuction({ onCreated, onBack }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    category: "Other",
    description: "",
    basePrice: "",
    durationMinutes: 10,
    imageFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const categories = [
    "Furniture & Essentials",
    "Study & Electronics",
    "Kitchen & Appliances",
    "Personal & Miscellaneous",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile" && files?.[0]) {
      setForm((prev) => ({ ...prev, imageFile: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

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
      setPreview(null);
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
        {/* Drag & Drop Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
          className="border-dashed border-2 border-gray-400 rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 object-contain"
            />
          ) : (
            <p className="text-gray-500 text-center">
              Drag & drop image here, or click to select
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
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
