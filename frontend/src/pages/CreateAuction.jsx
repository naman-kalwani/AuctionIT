// src/components/CreateAuction.jsx
import { useState, useRef } from "react";
import { api } from "../api";
import { useAuth } from "../context/useAuth";

export default function CreateAuction({ onCreated, onBack }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    category: "",
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
    if (!form.category) {
      setMessage("⚠️ Please select a category.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));

      const res = await api.post("/api/auctions", fd);
      setMessage("✅ Auction created successfully.");
      setForm({
        title: "",
        category: "",
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
    <div className="max-w-xl mx-auto p-4 sm:p-6 mt-4 mb-4 sm:mt-6 bg-linear-to-b from-white/90 to-white/70 backdrop-blur-md rounded-3xl shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        Create Auction
      </h2>

      {message && (
        <div className="mb-4 p-3 rounded-xl text-center bg-yellow-100 text-yellow-800 shadow-sm text-sm sm:text-base">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        {/* Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
          className="flex flex-col items-center justify-center cursor-pointer rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 p-4 sm:p-6 shadow-inner relative min-h-[150px] sm:min-h-[200px]"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 sm:max-h-52 w-full object-contain rounded-xl"
            />
          ) : (
            <p className="text-gray-400 text-center text-xs sm:text-sm px-2">
              Drag & drop an image here, or click to select
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

        {/* Title */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter auction title"
          className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-primary outline-none shadow-sm text-gray-700 placeholder-gray-400 text-sm sm:text-base"
          required
        />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-primary outline-none shadow-sm text-gray-700 text-sm sm:text-base"
          required
        >
          <option value="" disabled hidden>
            Select Category
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter description"
          className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-primary outline-none shadow-sm text-gray-700 placeholder-gray-400 min-h-80px sm:min-h-[100px] text-sm sm:text-base"
        />

        {/* Base Price */}
        <input
          name="basePrice"
          type="number"
          value={form.basePrice}
          onChange={handleChange}
          placeholder="Base Price (₹)"
          className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-primary outline-none shadow-sm text-gray-700 placeholder-gray-400 text-sm sm:text-base"
          required
        />

        {/* Duration */}
        <input
          name="durationMinutes"
          type="number"
          value={form.durationMinutes}
          onChange={handleChange}
          placeholder="Duration (minutes)"
          className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-primary outline-none shadow-sm text-gray-700 placeholder-gray-400 text-sm sm:text-base"
          required
        />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
          <button
            type="submit"
            className="flex-1 text-white px-4 py-2.5 sm:py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition cursor-pointer text-sm sm:text-base"
            style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
          >
            {loading ? "Creating..." : "Create Auction"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2.5 sm:py-3 rounded-2xl font-semibold shadow hover:shadow-md transition cursor-pointer text-sm sm:text-base"
          >
            ← Back
          </button>
        </div>
      </form>
    </div>
  );
}
