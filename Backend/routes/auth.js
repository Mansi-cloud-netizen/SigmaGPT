import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ---------------- TOKEN GENERATOR ----------------

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "7d" }
  );
};

// ---------------- LOCAL SIGNUP ----------------

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Please provide name, email and password" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = new User({
      email,
      password,
      name
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ---------------- LOCAL LOGIN ----------------

router.post("/login", (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  passport.authenticate("local", { session: false }, (err, user, info) => {

    if (err) {
      console.error("Passport error:", err);
      return res.status(500).json({ error: "Authentication error" });
    }

    if (!user) {
      return res.status(400).json({ error: info?.message || "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  })(req, res, next);
});

// ---------------- GOOGLE AUTH ----------------

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://sigmagpt-frontend-ns7g.onrender.com/?error=auth_failed",
    session: false
  }),
  (req, res) => {

    const token = generateToken(req.user);

    res.redirect(
      `https://sigmagpt-frontend-ns7g.onrender.com/?token=${token}`
    );
  }
);

// ---------------- GET CURRENT USER ----------------

router.get("/me", async (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });

  } catch (error) {
    console.error("Auth check error:", error);
    res.status(401).json({ error: "Invalid token" });
  }

});

// ---------------- TOKEN VERIFY MIDDLEWARE ----------------

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    req.user = decoded;

  } catch (err) {
    req.user = null;
  }

  next();
};

export default router;
