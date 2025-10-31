import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const { Pool } = pg;

// Konfiguration der Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, // "db" im Docker-Netzwerk
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * Stellt eine Verbindung zur Datenbank her und erstellt die "memories"-Tabelle.
 */
export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('✅ PostgreSQL verbunden.');

    // SQL zum Erstellen der Tabelle (inkl. Textfeld)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS memories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        text TEXT, -- ✅ Beschreibungstext zum Bild
        file_path VARCHAR(255) NOT NULL,
        uploaded_by_user_id INTEGER, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ Tabelle "memories" erfolgreich geprüft/erstellt.');

  } catch (error) {
    console.error('❌ Fehler beim Verbinden der Datenbank oder Initialisieren:', error.message);
    process.exit(1); 
  }
};

/**
 * Führt eine SQL-Abfrage aus
 */
export const query = (text, params) => pool.query(text, params);
