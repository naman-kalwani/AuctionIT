// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.js";
import { api, setupApi } from "../api.js";

const STORAGE_KEY = "auction_user"; // keep consistent

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // whenever user changes, persist and configure axios + socket usage
  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setupApi(user.token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setupApi(null);
    }
  }, [user]);

  // login -> stores user object and token (backend returns: { user: { username, email }, token })
  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    // normalize and store as { username, email, token }
    const fullUser = { ...data.user, token: data.token };
    setUser(fullUser);
    return fullUser;
  };

  // signup -> stores user object and token
  const signup = async (name, email, password) => {
    const { data } = await api.post("/api/auth/signup", {
      name,
      email,
      password,
    });
    const fullUser = { ...data.user, token: data.token };
    setUser(fullUser);
    return fullUser;
  };

  const logout = () => {
    setUser(null);
    // optionally disconnect socket from outside (App will handle)
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
