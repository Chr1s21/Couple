import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { query } from './database.js';

const router = Router();

// --- Multer Konfiguration (Uploads lokal speichern) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- Dummy Auth (später JWT) ---
const authenticateToken = (req, res, next) => {
  req.userId = 1; // Platzhalter Benutzer
  next();
};

// --- API ROUTES ---

// ✅ Test-Route
router.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API online ✅' });
});

// ✅ Speicher Memory (Bild + Text)
router.post('/memories/upload', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
  }

  try {
    const filePath = req.file.path;

    // 📥 Request Body Werte inkl. neuem text-Feld
    const { title, description, text } = req.body;

    // 💾 In DB speichern
    const newMemory = await query(
      `INSERT INTO memories (title, description, file_path, uploaded_by_user_id, text) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        title || 'Gemeinsame Erinnerung',
        description || 'Ein schöner Moment.',
        filePath,
        req.userId,
        text || "" // ✅ Wenn kein Text eingegeben wurde
      ]
    );

    res.status(201).json({
      message: 'Erinnerung erfolgreich gespeichert!',
      memory: newMemory.rows[0],
      public_url: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error('Datenbankfehler beim Speichern der Erinnerung:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Erinnerung.' });
  }
});

// ✅ Alle Memories abrufen
router.get('/memories', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM memories ORDER BY created_at DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Erinnerungen:', error);
    res.status(500).json({ error: 'Abrufen der Erinnerungen fehlgeschlagen.' });
  }
});

export default router;
