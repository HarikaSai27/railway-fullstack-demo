const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Railway gives us DATABASE_URL when we link the Postgres service
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("Database ready");
}

app.get("/", (req, res) => res.send("Backend is running"));

app.get("/api/notes", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM notes ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/notes", async (req, res) => {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO notes (text) VALUES ($1) RETURNING *",
      [text]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 3000;
initDb()
  .then(() => app.listen(PORT, "0.0.0.0", () => console.log("Listening on " + PORT)))
  .catch((e) => {
    console.error("Failed to init DB:", e);
    process.exit(1);
  });
