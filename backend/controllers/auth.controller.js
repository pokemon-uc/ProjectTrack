const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserById,
} = require("../models/user.model");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const department = req.body.department?.trim() || null;
    const requestedRole = req.body.role;

    if (requestedRole && requestedRole !== "student") {
      return res.status(403).json({
        error: "Guide and coordinator accounts are institution-managed",
      });
    }
    if (!name || name.length < 2 || name.length > 120) {
      return res.status(400).json({ error: "Enter a valid full name" });
    }
    if (!email || !emailPattern.test(email) || email.length > 160) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters",
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser(name, email, passwordHash, department);
    res.status(201).json({ message: "Student account created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create account" });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    const isMatch = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to sign in" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to load user" });
  }
};

module.exports = { register, login, getMe };
