// server/routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Fetch /me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// SIGNUP / REGISTER
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username: name, email, password: hashed });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

// // server/routes/authRoutes.js
// import express from "express";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { verifyToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.get("/me", verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// // Register
// router.post("/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     if (!username || !email || !password)
//       return res.status(400).json({ error: "Missing fields" });

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ error: "Email already used" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, email, password: hashed });

//     return res.json({ message: "Registered", user: { username, email } });
//   } catch (err) {
//     console.error("register error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ error: "Missing fields" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ error: "Wrong password" });

//     const token = jwt.sign(
//       { id: user._id, username: user.username, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({ token, username: user.username, email: user.email });
//   } catch (err) {
//     console.error("login error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;
