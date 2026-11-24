const express = require("express");
const pool = require("../db");

const router = express.Router();

const allowedStatuses = [
    "Pending",
    "In progress",
    "Completed"
];

// Validate record ID
function validId(id) {
    return /^\d+$/.test(id) &&
        Number.isSafeInteger(Number(id)) &&
        Number(id) > 0;
}

// Validate request body
function validateRecord(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Request body must be a JSON object.";
    }

    const fields = ["title", "category", "description", "status"];

    for (const field of fields) {
        if (typeof body[field] !== "string") {
            return `${field} must be a string.`;
        }
    }

    const title = body.title.trim();
    const category = body.category.trim();
    const description = body.description.trim();
    const status = body.status.trim();

    if (title.length < 3 || title.length > 80) {
        return "Title must be between 3 and 80 characters.";
    }

    if (category.length < 2 || category.length > 40) {
        return "Category must be between 2 and 40 characters.";
    }

    if (description.length < 5 || description.length > 300) {
        return "Description must be between 5 and 300 characters.";
    }

    if (!allowedStatuses.includes(status)) {
        return "Status must be Pending, In progress, or Completed.";
    }

    return null;
}

// GET ALL RECORDS
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM records ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET ONE RECORD
router.get("/:id", async (req, res, next) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                error: "ID must be a positive whole number."
            });
        }

        const result = await pool.query(
            "SELECT * FROM records WHERE id = $1",
            [Number(req.params.id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// CREATE RECORD
router.post("/", async (req, res, next) => {
    try {
        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                error: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `INSERT INTO records
             (title, category, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                title.trim(),
                category.trim(),
                description.trim(),
                status.trim()
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// UPDATE RECORD
router.put("/:id", async (req, res, next) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                error: "ID must be a positive whole number."
            });
        }

        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                error: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `UPDATE records
             SET title = $1,
                 category = $2,
                 description = $3,
                 status = $4
             WHERE id = $5
             RETURNING *`,
            [
                title.trim(),
                category.trim(),
                description.trim(),
                status.trim(),
                Number(req.params.id)
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE RECORD
router.delete("/:id", async (req, res, next) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                error: "ID must be a positive whole number."
            });
        }

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING id",
            [Number(req.params.id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;