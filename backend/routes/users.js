// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.

import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

// ✅ Create table if not exists
router.get("/init", async (req, res) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT
    )
  `);
  res.send("✅ Table ready!");
});

// ✅ Add a user
router.post("/add", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const result = await pool.query(
    "INSERT INTO users (name) VALUES ($1) RETURNING *",
    [name]
  );
  res.json(result.rows[0]);
});

// ✅ Get all users
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  res.json(result.rows);
});

export default router;
