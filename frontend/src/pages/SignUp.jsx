// src/pages/Signup.jsx
import { useState } from "react";
import { useAuth } from "../context/useAuth";

export default function Signup({ onSwitch, onSignupSuccess }) {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSignup = async () => {
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
    <div className="max-w-sm mx-auto p-6 mt-16 border shadow rounded bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
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
        className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-green-400"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-green-400"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-green-400"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-green-600 text-white px-4 py-2 w-full rounded hover:bg-green-700 transition"
      >
        Sign Up
      </button>

      <p className="text-center mt-3 text-sm">
        Already have an account?{" "}
        <span
          onClick={onSwitch}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  );
}
