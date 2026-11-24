require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const recordsRouter = require("./routes/records");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGINS
        ? process.env.CLIENT_ORIGINS.split(",")
        : true
}));

app.use(express.json());

// API GUIDE
app.get("/", (req, res) => {
    const baseURL = `${req.protocol}://${req.get("host")}`;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Nexus IT Support Desk API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    background: #f4f6f9;
                    color: #222;
                }
                h1 { color: #173b65; }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    background: white;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 12px;
                    text-align: left;
                }
                th { background: #173b65; color: white; }
                code {
                    background: #e8edf4;
                    padding: 3px 6px;
                }
                pre {
                    background: #e8edf4;
                    padding: 15px;
                    overflow-x: auto;
                }
            </style>
        </head>
        <body>
            <h1>Nexus IT Support Desk API</h1>

            <p><strong>Student Number:</strong> 202509173</p>
            <p><strong>Description:</strong> A REST API for managing IT support records.</p>
            <p><strong>Base URL:</strong> ${baseURL}</p>

            <h2>Useful Links</h2>
            <p><a href="${baseURL}/health">Health Check</a></p>
            <p><a href="${baseURL}/api/records">View All Records</a></p>

            <h2>Available Routes</h2>

            <table>
                <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                </tr>
                <tr><td>GET</td><td>/</td><td>API guide</td></tr>
                <tr><td>GET</td><td>/health</td><td>Check API and database health</td></tr>
                <tr><td>GET</td><td>/api/records</td><td>Get all records</td></tr>
                <tr><td>GET</td><td>/api/records/:id</td><td>Get one record</td></tr>
                <tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
                <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
                <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
            </table>

            <h2>Record Fields</h2>
            <ul>
                <li>title: 3–80 characters</li>
                <li>category: 2–40 characters</li>
                <li>description: 5–300 characters</li>
                <li>status: Pending, In progress, or Completed</li>
                <li>id: generated automatically by the database</li>
            </ul>

            <h2>Example POST/PUT JSON Body</h2>
            <pre>{
  "title": "Computer not starting",
  "category": "Hardware",
  "description": "The office computer does not start.",
  "status": "Pending"
}</pre>

            <h2>HTTP Status Codes</h2>
            <ul>
                <li>200: Request successful</li>
                <li>201: Record created</li>
                <li>400: Invalid input or malformed JSON</li>
                <li>404: Record or route not found</li>
                <li>500: Unexpected server error</li>
                <li>503: Database unavailable</li>
            </ul>

            <p>Note: The hosted service may take a short time to respond after being idle.</p>
        </body>
        </html>
    `);
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
app.use("/api/records", recordsRouter);

// UNKNOWN ROUTE
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found."
    });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            error: "Invalid JSON format."
        });
    }

    res.status(500).json({
        error: "Internal server error."
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});