// src/context/useAuth.js
import { useContext } from "react";
import { AuthContext } from "./AuthContext.js";

export const useAuth = () => useContext(AuthContext);
