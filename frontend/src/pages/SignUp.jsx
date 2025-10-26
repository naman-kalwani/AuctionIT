// src/pages/Signup.jsx
import { useState } from "react";
import { useAuth } from "../context/useAuth";

export default function Signup({ onSwitch, onSignupSuccess }) {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Track touched fields
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  // Validation function
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
    // Mark all as touched to trigger validation
    setTouched({ username: true, email: true, password: true });
    if (Object.keys(errors).length > 0) {
      setMsg("⚠️ Please fix the errors above.");
      return;
    }
    setMsg("");
    try {
      await signup(username, email, password);
      setMsg("✅ Account created successfully!");
      onSignupSuccess && onSignupSuccess();
    } catch (err) {
      console.error(err);
      setMsg("❌ Signup failed. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg animate-fadeIn">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Create Account
      </h2>

      {msg && (
        <p
          className={`mb-4 text-center ${
            msg.startsWith("✅")
              ? "text-green-600 bg-green-100 p-2 rounded"
              : "text-red-600 bg-red-100 p-2 rounded"
          }`}
        >
          {msg}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {/* Username */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
            className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${
              errors.username
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-green-400 border-gray-300"
            }`}
            placeholder="Enter username"
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
            className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${
              errors.email
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-green-400 border-gray-300"
            }`}
            placeholder="Enter email"
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
            className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${
              errors.password
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-green-400 border-gray-300"
            }`}
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
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
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={onSwitch}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
