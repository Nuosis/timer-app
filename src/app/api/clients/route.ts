import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Set up the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'src', 'app', 'data', 'timerTracker.db'),
    driver: sqlite3.Database,
  });
}

// GET handler for fetching clients
export async function GET() {
  try {
    const db = await openDb();
    const clients = await db.all('SELECT * FROM clients');
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new NextResponse('Error fetching clients', { status: 500 });
  }
}

// POST handler for adding a new client
export async function POST(req: NextRequest) {
  try {
    const db = await openDb();
    const { name } = await req.json();
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    await db.run('INSERT INTO clients (name) VALUES (?)', [name]);
    return new NextResponse('Client added successfully', { status: 201 });
  } catch (error) {
    console.error('Error adding client:', error);
    return new NextResponse('Error adding client', { status: 500 });
  }
}

