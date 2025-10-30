import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './database.js'; // Wird später erstellt
import apiRoutes from './routes.js'; // Wird später erstellt

// Umgebungsvariablen laden (für lokale Tests außerhalb von Docker)
dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json()); // Für JSON-Body-Parsing
app.use(express.urlencoded({ extended: true }));

// Statische Ordner für Bilder
// Wenn Sie Bilder lokal im Docker-Volume speichern, machen Sie sie zugänglich
app.use('/uploads', express.static('uploads')); 

// Routen
app.get('/', (req, res) => {
  res.status(200).send('Couple API läuft! Bereit für Anfragen.');
});

app.use('/api', apiRoutes);

// Server starten
app.listen(PORT, async () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  
  // Verbindung zur Datenbank herstellen
  await connectDB();
  
  // HINWEIS FÜR MOBILENTWICKLUNG:
  // Mobile Clients (Expo) MÜSSEN die IP-Adresse des Host-Rechners verwenden,
  // NICHT 'localhost' oder '127.0.0.1', um das Backend zu erreichen!
});

// Wichtig: Fügen Sie in Ihre App.js die HOST-IP ein, z.B. http://192.168.1.10:3000/api/...