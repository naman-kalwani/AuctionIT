// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  const validate = () => {
    const errors = {};
    if (touched.username && !username.trim())
      errors.username = "Please enter a username.";
    if (touched.email) {
      if (!email.trim()) errors.email = "Email is required.";
      else if (!/^.+@(vitstudent\.ac\.in|vit\.ac\.in)$/.test(email))
        errors.email = "Email must be @vitstudent.ac.in or @vit.ac.in.";
    }
    if (touched.password) {
      if (!password) errors.password = "Password is required.";
      else if (password.length < 6)
        errors.password = "Password must be at least 6 characters.";
    }
    return errors;
  };

  const errors = validate();

  const handleSignup = async () => {
    setTouched({ username: true, email: true, password: true });
    if (Object.keys(errors).length > 0) {
      setMsg("⚠️ Please fix the errors above.");
      return;
    }
    setMsg("");
    try {
      await signup(username, email, password);
      setMsg("✅ Account created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setMsg("❌ Signup failed. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-md rounded-3xl shadow-xl animate-fadeIn">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Create Account
      </h2>

      {msg && (
        <p
          className={`mb-4 text-center p-2 rounded shadow-sm ${
            msg.startsWith("✅")
              ? "text-green-600 bg-green-100"
              : "text-red-600 bg-red-100"
          }`}
        >
          {msg}
        </p>
      )}

      <div className="flex flex-col gap-5">
        {/* Username */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
            placeholder="Enter username"
            className={`rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 transition text-gray-700 placeholder-gray-400 ${
              errors.username
                ? "border border-red-400 focus:ring-red-400"
                : "border border-gray-200 focus:ring-primary"
            }`}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="Enter email"
            className={`rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 transition text-gray-700 placeholder-gray-400 ${
              errors.email
                ? "border border-red-400 focus:ring-red-400"
                : "border border-gray-200 focus:ring-primary"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col relative">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            placeholder="Enter password"
            className={`rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 transition text-gray-700 placeholder-gray-400 ${
              errors.password
                ? "border border-red-400 focus:ring-red-400"
                : "border border-gray-200 focus:ring-primary"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSignup}
          className="py-3 rounded-2xl font-semibold shadow-lg text-white transition hover:shadow-xl"
          style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-primary cursor-pointer hover:underline"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
