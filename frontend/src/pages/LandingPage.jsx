import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  // TODO : 

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center flex-1 py-32 px-6 bg-linear-gradient-to-b from-white to-gray-100">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight max-w-4xl text-black"
        >
          Welcome to <span style={{ color: "oklch(37.9% .146 265.522)" }}>AuctionIT</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl"
        >
          Participate in live auctions, get items, and sell securely. Fast
          updates, clear history, and fun competitions await!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
            style={{ backgroundColor: "oklch(37.9% .146 265.522)" }}
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="border px-6 py-3 rounded-xl font-semibold transition hover:bg-gray-200 cursor-pointer"
            style={{
              borderColor: "oklch(37.9% .146 265.522)",
              color: "oklch(37.9% .146 265.522)",
            }}
          >
            Login
          </button>
        </motion.div>

        {/* Auction Illustration or Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-16 w-full max-w-4xl"
        >
          <img
            src="/images/auction-hero.svg"
            alt="Auction illustration"
            className="w-full h-auto rounded-xl shadow-xl"
          />
        </motion.div>
      </section>

      {/* Why Choose Section */}
      <section className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-12"
            style={{ color: "oklch(37.9% .146 265.522)" }}
          >
            Why Choose AuctionIT?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Bidding",
                desc: "Live updates powered by sockets — every bid counts instantly.",
              },
              {
                title: "Secure & Transparent",
                desc: "Fair auctions with logged history and verified transactions.",
              },
              {
                title: "Quick Listings",
                desc: "Create auctions in minutes with clear images & descriptions.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-transform hover:scale-105"
              >
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "oklch(37.9% .146 265.522)" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
