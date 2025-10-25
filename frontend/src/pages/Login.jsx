// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/useAuth";

export default function Login({ onSwitch, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    setMsg("");
    try {
      await login(email, password);
      setMsg("✅ Logged in successfully!");
      onLoginSuccess && onLoginSuccess();
    } catch (err) {
      console.error(err);
      setMsg("❌ Invalid login credentials.");
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 mt-16 border shadow rounded bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {msg && (
        <p
          className={`mb-4 text-center ${
            msg.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <input
        className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-blue-400"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-blue-400"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700 transition"
      >
        Login
      </button>
      <p className="text-center mt-3 text-sm">
        New user?{" "}
        <span
          onClick={onSwitch}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          Create Account
        </span>
      </p>
    </div>
  );
}
