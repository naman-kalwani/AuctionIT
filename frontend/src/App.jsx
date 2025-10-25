// src/App.jsx
import { useState, useEffect } from "react";
import { socket } from "./socket";
import { api } from "./api";
import { useAuth } from "./context/useAuth";

import AuctionList from "./components/AuctionList";
import AuctionRoom from "./components/AuctionRoom";
import CreateAuction from "./components/CreateAuction";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(user ? "home" : "login");
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // fetch auctions on mount or when user changes (home only)
  useEffect(() => {
    let canceled = false;
    const fetch = async () => {
      try {
        const { data } = await api.get("/api/auctions");
        if (!canceled) setAuctions(data || []);
      } catch (err) {
        console.error("fetch auctions error:", err);
      }
    };

    if (user) {
      setPage("home");
      fetch();

      // attach token to socket and connect
      socket.auth = { token: user.token };
      if (!socket.connected) socket.connect();

      // global listeners
      const onBidUpdated = (data) => {
        setAuctions((prev) =>
          prev.map((a) =>
            String(a._id) === String(data.auctionId)
              ? {
                  ...a,
                  currentBid: data.currentBid,
                  highestBidder: data.highestBidder,
                }
              : a
          )
        );
      };
      const onAuctionCreated = (newAuction) => {
        setAuctions((prev) => [newAuction, ...prev]);
      };
      const onAuctionEnded = (data) => {
        setAuctions((prev) =>
          prev.map((a) =>
            String(a._id) === String(data.auctionId)
              ? { ...a, ended: true, currentBid: data.finalBid ?? a.currentBid }
              : a
          )
        );
      };

      socket.on("bid-updated", onBidUpdated);
      socket.on("auction-created", onAuctionCreated);
      socket.on("auction-ended", onAuctionEnded);

      return () => {
        canceled = true;
        socket.off("bid-updated", onBidUpdated);
        socket.off("auction-created", onAuctionCreated);
        socket.off("auction-ended", onAuctionEnded);
      };
    } else {
      // ensure disconnected when logged out
      if (socket.connected) socket.disconnect();
      setAuctions([]);
      setSelectedAuction(null);
      setShowCreate(false);
      setPage("login");
    }
  }, [user]);

  // simple page switch handlers passed to login/signup pages
  const onLoginSuccess = () => {
    setPage("home");
  };

  // render flows
  if (!user && page === "login")
    return (
      <Login
        onSwitch={() => setPage("signup")}
        onLoginSuccess={onLoginSuccess}
      />
    );

  if (!user && page === "signup")
    return (
      <Signup
        onSwitch={() => setPage("login")}
        onSignupSuccess={onLoginSuccess}
      />
    );

  // HOME
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-xl">
          Welcome, {user?.username ?? "User"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              logout();
              setPage("login");
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {!selectedAuction && !showCreate && (
        <>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create Auction
            </button>
          </div>

          <AuctionList auctions={auctions} onSelect={setSelectedAuction} />
        </>
      )}

      {showCreate && (
        <CreateAuction
          onCreated={(created) => {
            setShowCreate(false);
            setSelectedAuction(created);
          }}
          onBack={() => setShowCreate(false)}
        />
      )}

      {selectedAuction && (
        <AuctionRoom
          auction={
            auctions.find(
              (a) => String(a._id) === String(selectedAuction._id)
            ) || selectedAuction
          }
          onBack={() => setSelectedAuction(null)}
          user={user}
        />
      )}
    </div>
  );
}

// // src/App.jsx
// import { useState, useEffect } from "react";
// import AuctionList from "./components/AuctionList";
// import AuctionRoom from "./components/AuctionRoom";
// import CreateAuction from "./components/CreateAuction";
// import { socket } from "./socket";
// import axios from "axios";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// function App() {
//   const [selectedAuction, setSelectedAuction] = useState(null);
//   const [showCreate, setShowCreate] = useState(false);
//   const [auctions, setAuctions] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     axios
//       .get(`${API}/api/auctions`)
//       .then((res) => mounted && setAuctions(res.data || []))
//       .catch((err) => console.error("fetch auctions:", err));

//     if (!socket.connected) socket.connect();

//     const onBidUpdated = (data) => {
//       setAuctions((prev) =>
//         prev.map((a) =>
//           String(a._id) === String(data.auctionId)
//             ? {
//                 ...a,
//                 currentBid: data.currentBid,
//                 highestBidder: data.highestBidder,
//               }
//             : a
//         )
//       );
//     };

//     const onAuctionEnded = (data) => {
//       setAuctions((prev) =>
//         prev.map((a) =>
//           String(a._id) === String(data.auctionId)
//             ? { ...a, ended: true, currentBid: data.finalBid ?? a.currentBid }
//             : a
//         )
//       );
//     };

//     const onAuctionCreated = (newAuction) => {
//       setAuctions((prev) => [newAuction, ...prev]);
//     };

//     socket.on("bid-updated", onBidUpdated);
//     socket.on("auction-ended", onAuctionEnded);
//     socket.on("auction-created", onAuctionCreated);

//     return () => {
//       mounted = false;
//       socket.off("bid-updated", onBidUpdated);
//       socket.off("auction-ended", onAuctionEnded);
//       socket.off("auction-created", onAuctionCreated);
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       {!selectedAuction && !showCreate && (
//         <>
//           <div className="flex justify-center mb-4">
//             <button
//               onClick={() => setShowCreate(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//             >
//               + Create Auction
//             </button>
//           </div>

//           <AuctionList auctions={auctions} onSelect={setSelectedAuction} />
//         </>
//       )}

//       {showCreate && (
//         <CreateAuction
//           onCreated={(created) => {
//             setShowCreate(false);
//             setSelectedAuction(created);
//             setTimeout(() => setSelectedAuction(null), 500); // keep selection brief
//           }}
//           onBack={() => setShowCreate(false)}
//         />
//       )}

//       {selectedAuction && (
//         <AuctionRoom
//           auction={
//             auctions.find(
//               (a) => String(a._id) === String(selectedAuction._id)
//             ) || selectedAuction
//           }
//           onBack={() => setSelectedAuction(null)}
//         />
//       )}
//     </div>
//   );
// }

// export default App;
