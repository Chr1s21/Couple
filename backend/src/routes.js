import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { query } from './database.js';

const router = Router();

// --- Konfiguration für Multer (lokale Dateiverwaltung) ---
// Ziel: Bilder temporär oder für die Entwicklung lokal im Container-Volume speichern.
// Der 'uploads' Ordner muss im Hauptverzeichnis des Backends existieren und als Volume in Docker-Compose definiert sein!
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Speichert Dateien im Ordner 'uploads' relativ zum Container-WORKDIR
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Erstellt einen eindeutigen Dateinamen
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// Multer initialisieren
const upload = multer({ storage: storage });

// ----------------------------------------------------
// Dummy-Logik für die Authentifizierung (wird später ersetzt)
// ----------------------------------------------------
const authenticateToken = (req, res, next) => {
  // TODO: Hier wird später die JWT-Token-Validierung implementiert!
  // Beispiel: 
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  // if (token == null) return res.sendStatus(401); 
  
  // Für jetzt lassen wir es durch (TEMPORÄR: Authentifizierung fehlt noch)
  req.userId = 1; // Simulierter eingeloggter User
  next();
};

// ----------------------------------------------------
// API-Endpunkte
// ----------------------------------------------------

// 1. Test-Endpunkt
router.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Endpunkte sind erreichbar.' });
});


// 2. Bild-Upload-Endpunkt
router.post('/memories/upload', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
  }

  try {
    // 1. Lokaler Speicherpfad des Bildes (innerhalb des Containers)
    const filePath = req.file.path; 

    // 2. Speichern des Eintrags in der Datenbank
    const newMemory = await query(
      'INSERT INTO memories (title, description, file_path, uploaded_by_user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        req.body.title || 'Gemeinsame Erinnerung', 
        req.body.description || 'Ein schöner Moment.', 
        filePath, 
        req.userId // Simulierter User
      ]
    );

    // 3. Erfolgreiche Antwort an die App
    res.status(201).json({ 
      message: 'Erinnerung erfolgreich gespeichert!',
      memory: newMemory.rows[0],
      // Wichtig: Die mobile App muss diesen Pfad über den API-Port erreichen! 
      // z.B. http://HOST-IP:3000/uploads/DATEINAME.jpg
      public_url: `/uploads/${req.file.filename}` 
    });

  } catch (error) {
    console.error('Datenbankfehler beim Speichern der Erinnerung:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Erinnerung in der Datenbank.' });
  }
});

// 3. (Platzhalter) Alle Erinnerungen abrufen
router.get('/memories', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM memories ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Fehler beim Abrufen der Erinnerungen:', error);
        res.status(500).json({ error: 'Abrufen der Erinnerungen fehlgeschlagen.' });
    }
});


export default router;