
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGINS
        ? process.env.CLIENT_ORIGINS.split(",")
        : true
}));

app.use(express.json());

// Create the table if it does not exist.
// Existing records are preserved.
async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            title VARCHAR(80) NOT NULL,
            category VARCHAR(40) NOT NULL,
            description VARCHAR(300) NOT NULL,
            status VARCHAR(20) NOT NULL
                CHECK (status IN ('Pending', 'In progress', 'Completed'))
        );
    `);

    console.log("Records table is ready.");
}

// API GUIDE
app.get("/", (req, res) => {
    res.send("Nexus IT Support Desk API is running.");
});

// HEALTH CHECK
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            message: "API and database are running."
        });
    } catch (error) {
        console.error(error);
        res.status(503).json({
            status: "ERROR",
            message: "Database unavailable."
        });
    }
});

// RECORD ROUTES
app.get("/api/records", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM records ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/records", async (req, res) => {
    try {
        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `INSERT INTO records (title, category, description, status)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, category, description, status]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.put("/api/records/:id", async (req, res) => {
    try {
        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `UPDATE records
             SET title = $1, category = $2, description = $3, status = $4
             WHERE id = $5 RETURNING *`,
            [title, category, description, status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Record not found." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.delete("/api/records/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Record not found." });
        }

        res.json({ message: "Record deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// UNKNOWN ROUTE
app.use((req, res) => {
    res.status(404).json({ error: "Route not found." });
});

// START SERVER AFTER DATABASE INITIALIZATION
async function startServer() {
    try {
        await initializeDatabase();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    }
}

startServer();
