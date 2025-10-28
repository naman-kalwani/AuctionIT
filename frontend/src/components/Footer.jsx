import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaHeart,
} from "react-icons/fa";

export default function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <footer className="w-full bg-gray-900 text-white border-t border-purple-500/30">
      <div className="w-full py-8 sm:py-10 md:py-12 px-6 sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 max-w-7xl mx-auto">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              AuctionIT💸
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4 max-w-md">
              🗿 VIT's Campus Marketplace — Trade textbooks, gadgets, hostel
              stuff & more! Built by students, for students. Real-time bidding
              with verified VITians only.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="group w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 border border-gray-700 hover:border-purple-500"
              >
                <FaFacebook className="text-lg group-hover:text-white text-gray-400 transition-colors" />
              </a>
              <a
                href="#"
                className="group w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-blue-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 border border-gray-700 hover:border-blue-400"
              >
                <FaTwitter className="text-lg group-hover:text-white text-gray-400 transition-colors" />
              </a>
              <a
                href="#"
                className="group w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 border border-gray-700 hover:border-pink-500"
              >
                <FaInstagram className="text-lg group-hover:text-white text-gray-400 transition-colors" />
              </a>
              <a
                href="#"
                className="group w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-blue-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 border border-gray-700 hover:border-blue-600"
              >
                <FaLinkedin className="text-lg group-hover:text-white text-gray-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <span className="text-purple-400">→</span> Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate("/home")}
                  className="text-gray-400 hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-purple-400 transition-colors"></span>
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/home")}
                  className="text-gray-400 hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-purple-400 transition-colors"></span>
                  Browse Auctions
                </button>
              </li>
              {!user && (
                <>
                  <li>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-gray-400 hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-purple-400 transition-colors"></span>
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/signup")}
                      className="text-gray-400 hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-purple-400 transition-colors"></span>
                      Sign Up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <span className="text-purple-400">✦</span> Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-400 hover:text-purple-400 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors border border-gray-700">
                  📧
                </span>
                <span>support@auctionit.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 hover:text-purple-400 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors border border-gray-700">
                  📞
                </span>
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 hover:text-purple-400 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors border border-gray-700">
                  📍
                </span>
                <span>Jaipur, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-semibold">AuctionIT</span>. All
            rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <button className="hover:text-purple-400 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button className="hover:text-purple-400 transition-colors cursor-pointer">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
