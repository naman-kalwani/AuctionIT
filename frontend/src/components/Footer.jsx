import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <footer
      className="w-full bg-gray-900 text-white bg-gray-800"
    >
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <p className="text-xs sm:text-sm text-center sm:text-left">
          © {new Date().getFullYear()} AuctionIT — All rights reserved.
        </p>
        {!user && (
          <div className="flex gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-xs sm:text-sm hover:underline cursor-pointer transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-xs sm:text-sm hover:underline cursor-pointer transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
