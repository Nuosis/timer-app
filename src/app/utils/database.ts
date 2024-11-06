import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Singleton instance for the database
let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

// Open an SQLite database instance and ensure tables are set up
async function initializeDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: './src/app/data/timerTracker.db',
    driver: sqlite3.Database
  });

  // Create tables if they do not exist
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS timeLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId INTEGER,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      elapsed TEXT,
      notes TEXT,
      exported BOOLEAN DEFAULT 0,
      FOREIGN KEY (clientId) REFERENCES clients (id)
    )
  `);

  return dbInstance;
}

// Example function to add a client to the database
export async function addClient(clientName: string) {
  const db = await initializeDatabase();
  await db.run('INSERT INTO clients (name) VALUES (?)', [clientName]);
}

// Example function to get all clients from the database
export async function getClients() {
  const db = await initializeDatabase();
  const clients = await db.all('SELECT * FROM clients');
  return clients;
}

// Example function to add a time log to the database
export async function addTimeLog(clientId: number, startTime: string, endTime: string, elapsed: number) {
  const db = await initializeDatabase();
  await db.run('INSERT INTO timeLogs (clientId, startTime, endTime, elapsed) VALUES (?, ?, ?, ?)', [clientId, startTime, endTime, elapsed]);
}

// Example function to get time logs by client ID
export async function getTimeLogs(clientId: number) {
  const db = await initializeDatabase();
  const timeLogs = await db.all('SELECT * FROM timeLogs WHERE clientId = ?', [clientId]);
  return timeLogs;
}

// Example of integrating the database in the API (Next.js API route)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const clients = await getClients();
      res.status(200).json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ message: 'Error fetching clients' });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    try {
      await addClient(name);
      res.status(201).json({ message: 'Client added successfully' });
    } catch (error) {
      console.error('Error adding client:', error);
      res.status(500).json({ message: 'Error adding client' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
