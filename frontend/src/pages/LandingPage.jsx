import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // used for animations via <motion.*>
import {
  FaBolt,
  FaShieldAlt,
  FaRocket,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import { api } from "../api";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredAuctions, setFeaturedAuctions] = useState([]);

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  useEffect(() => {
    // Load featured/sample auctions
    const loadFeaturedAuctions = async () => {
      try {
        const { data } = await api.get("/api/auctions");
        // Get 3 recent ended auctions for showcase
        const featured = data
          .filter((a) => a.ended)
          .sort((a, b) => new Date(b.endAt) - new Date(a.endAt))
          .slice(0, 3);
        setFeaturedAuctions(featured);
      } catch (err) {
        console.error("Error loading featured auctions:", err);
        // Set some sample data if API fails
        setFeaturedAuctions([
          {
            _id: "1",
            title: "Vintage Camera",
            image: "https://placehold.co/400x300/e0e0e0/666?text=Camera",
            currentBid: 15000,
            category: "Electronics",
            ended: true,
          },
          {
            _id: "2",
            title: "Antique Watch",
            image: "https://placehold.co/400x300/e0e0e0/666?text=Watch",
            currentBid: 25000,
            category: "Accessories",
            ended: true,
          },
          {
            _id: "3",
            title: "Gaming Console",
            image: "https://placehold.co/400x300/e0e0e0/666?text=Console",
            currentBid: 30000,
            category: "Gaming",
            ended: true,
          },
        ]);
      }
    };
    loadFeaturedAuctions();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-8 md:py-12 px-6 bg-white">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-2 bg-purple-100 rounded-full text-sm font-semibold mb-6"
          style={{ color: "oklch(37.9% .146 265.522)" }}
        >
          Join fellow Students in Trading & Bidding! 🗿
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl text-black"
        >
          Campus Marketplace for{" "}
          <span style={{ color: "oklch(37.9% .146 265.522)" }}>Students💸</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mt-6 text-base md:text-xl text-gray-600 max-w-2xl leading-relaxed"
        >
          Sell your old textbooks, gadgets, or hostel stuff. Bid on amazing
          deals from fellow mates. From study materials to electronics — all in
          a <span className="font-bold text-blue-600">safe</span> and
          student-friendly platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
          >
            🚀 Start Bidding Now
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 rounded-xl font-bold border-2 transition-all duration-300 hover:bg-gray-100 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
            style={{
              borderColor: "oklch(37.9% .146 265.522)",
              color: "oklch(37.9% .146 265.522)",
            }}
          >
            Login
          </button>
        </motion.div>

        {/* Featured Auction Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-16 w-full max-w-6xl"
        >
          <h3
            className="text-3xl md:text-4xl font-extrabold mb-4 text-center"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            🔥 Hot Deals on Campus
          </h3>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Check out what your fellow students are selling. Snag great deals
            before they're gone!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAuctions.map((auction, idx) => (
              <motion.div
                key={auction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
                onClick={() => navigate("/login")}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-xl hover:shadow-2xl border border-gray-200 transition-all duration-500 hover:-translate-y-3 cursor-pointer"
              >
                {/* Live Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full shadow-xl animate-pulse">
                    🔥 LIVE
                  </span>
                </div>

                {/* Image */}
                <div className="bg-gray-100 aspect-4/3 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={auction.image || "https://placehold.co/400x300"}
                    alt={auction.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4
                    className="text-xl font-extrabold mb-3 truncate"
                    style={{ color: "oklch(37.9% .146 265.522)" }}
                  >
                    {auction.title}
                  </h4>
                  <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full font-bold text-xs mb-4">
                    {auction.category}
                  </span>
                  <div className="border-t border-purple-200 pt-4 mt-4">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
                      Current Bid
                    </p>
                    <p
                      className="text-3xl font-black"
                      style={{ color: "oklch(37.9% .146 265.522)" }}
                    >
                      ₹{(auction.currentBid || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    className="mt-5 text-center py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-xl"
                    style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
                  >
                    🔐 Login to Bid
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Why Choose Section - Horizontal Timeline Style */}
      <section className="w-full py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl md:text-5xl font-extrabold text-center mb-4"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            Why Campus Students Love Us?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg">
            Built by students, for students — your go-to platform for campus
            trading.
          </p>

          {/* Horizontal Layout with Connecting Line */}
          <div className="relative">
            {/* Connection Line */}
            <div
              className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-purple-200"
              style={{ width: "80%", margin: "0 auto" }}
            ></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {[
                {
                  icon: FaBolt,
                  title: "Live Bidding",
                  desc: "Real-time updates! See bids as they happen. Perfect for last-minute deals during exam season sales.",
                  iconBg: "bg-yellow-400",
                  iconColor: "text-white",
                },
                {
                  icon: FaShieldAlt,
                  title: "Safe & Trusted",
                  desc: "Trade only with verified campus students. Your hostel buddies, your classmates — all in one place.",
                  iconBg: "bg-green-400",
                  iconColor: "text-white",
                },
                {
                  icon: FaRocket,
                  title: "Quick Listings",
                  desc: "Sell your stuff in minutes. Upload pics, set a price, and let students bid. Easy peasy!",
                  iconBg: "bg-blue-400",
                  iconColor: "text-white",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Icon Circle */}
                  <div
                    className={`${item.iconBg} w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mb-6 relative z-10 transform hover:scale-110 transition-all duration-300`}
                  >
                    <item.icon className={`${item.iconColor} text-5xl`} />
                  </div>

                  {/* Content */}
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "oklch(37.9% .146 265.522)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Staggered Layout */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl md:text-5xl font-extrabold text-center mb-4"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            What Students Say
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg">
            Real stories from real students who've traded on our platform!
          </p>

          {/* Alternating Layout */}
          <div className="space-y-8">
            {[
              {
                name: "Rumali Roti",
                role: "CSE, 3rd Year",
                review:
                  "Sold my old laptop for a great price! Got a buyer from my own hostel. Super convenient and trustworthy platform.",
                rating: 5,
                avatar: "RR",
                align: "left",
              },
              {
                name: "Rajeev Ranjan",
                role: "ECE, 2nd Year",
                review:
                  "Bought second-hand textbooks at half the price. Saved so much money this semester. Thanks AuctionIT!",
                rating: 5,
                avatar: "RR",
                align: "right",
              },
              {
                name: "Ayush Gaur",
                role: "EEE, Final Year",
                review:
                  "Perfect for decluttering before graduation! Sold my cycle and study lamp. Easy and quick!",
                rating: 5,
                avatar: "AG",
                align: "left",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: item.align === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-6 ${
                  item.align === "right" ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-xl shadow-2xl"
                    style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
                  >
                    {item.avatar}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`flex-1 bg-purple-50 p-6 rounded-2xl shadow-lg border-l-4 ${
                    item.align === "right" ? "border-r-4 border-l-0" : ""
                  }`}
                  style={{ borderColor: "oklch(37.9% .146 265.522)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-500 text-base" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{item.review}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
