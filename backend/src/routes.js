import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { query } from './database.js';

const router = Router();

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Fake Auth
const authenticateToken = (req, res, next) => {
  req.userId = 1;
  next();
};

// ✅ API status
router.get('/status', (req, res) => {
  res.json({ status: 'OK' });
});

// ✅ Upload Memory
router.post('/memories/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const result = await query(
      `INSERT INTO memories (title, description, text, file_path, uploaded_by_user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.body.title || "Gemeinsame Erinnerung",
        req.body.description || "Ein schöner Moment.",
        req.body.text || "",
        req.file.path,
        req.userId
      ]
    );

    res.json({
      message: "Erinnerung erfolgreich gespeichert!",
      memory: result.rows[0],
      public_url: `/uploads/${req.file.filename}`
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Fehler beim Upload" });
  }
});

// ✅ Filter Memories by Year & Month
router.get('/memories/filter', authenticateToken, async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: "year und month sind erforderlich" });
  }

  try {
    const result = await query(
      `SELECT * FROM memories
       WHERE EXTRACT(YEAR FROM created_at) = $1
       AND EXTRACT(MONTH FROM created_at) = $2
       ORDER BY created_at ASC`,
      [year, month]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).json({ error: "Fehler beim Abrufen" });
  }
});

export default router;
