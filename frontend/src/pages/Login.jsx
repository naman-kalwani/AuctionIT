// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validate = () => {
    const errors = {};
    if (touched.email) {
      if (!email.trim()) errors.email = "Email is required.";
      else if (!/^.+@()$/.test(email));
      errors.email = "Email must be correct format.";
    }
    if (touched.password) {
      if (!password) errors.password = "Password is required.";
      else if (password.length < 5)
        errors.password = "Password must be at least 5 characters.";
    }
    return errors;
  };

  const errors = validate();

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) {
      setMsg("⚠️ Please fix the errors above.");
      return;
    }
    setMsg("");
    try {
      await login(email, password);
      setMsg("✅ Logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setMsg("❌ Invalid login credentials.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-8">
      <div className="max-w-md mx-auto mt-16 p-8 bg-linear-to-b from-white/90 to-white/70 backdrop-blur-md rounded-3xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        {msg && (
          <p
            className={`mb-4 text-center p-2 rounded ${
              msg.startsWith("✅")
                ? "text-green-600 bg-green-100 shadow-sm"
                : "text-red-600 bg-red-100 shadow-sm"
            }`}
          >
            {msg}
          </p>
        )}

        <div className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className={`rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 transition text-gray-700 placeholder-gray-400 ${
                errors.email
                  ? "border border-red-400 focus:ring-red-400"
                  : "border border-gray-200 focus:ring-primary"
              }`}
              placeholder="Enter your email"
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
              className={`rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 transition text-gray-700 placeholder-gray-400 ${
                errors.password
                  ? "border border-red-400 focus:ring-red-400"
                  : "border border-gray-200 focus:ring-primary"
              }`}
              placeholder="Enter your password"
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
            onClick={handleLogin}
            className="py-3 rounded-2xl font-semibold shadow-lg text-white transition hover:shadow-xl"
            style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            New user?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-primary cursor-pointer hover:underline"
              style={{ color: "oklch(37.9% .146 265.522)" }}
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
