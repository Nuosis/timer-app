import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'src', 'app', 'data', 'timerTracker.db'),
    driver: sqlite3.Database,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, elapsed, notes='' } = await req.json();
    if (!clientId || !elapsed ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await openDb();
    await db.run(
      'INSERT INTO timeLogs (clientId, elapsed, notes) VALUES (?, ?, ?)',
      clientId,
      elapsed,
      notes
    );

    return NextResponse.json({ message: 'Timer data saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving timer data:', error);
    return NextResponse.json({ error: 'Error saving timer data' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const db = await openDb();
    const timeLogs = await db.all('SELECT * FROM timeLogs WHERE clientId = ?', clientId);

    return NextResponse.json(timeLogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching time logs:', error);
    return NextResponse.json({ error: 'Error fetching time logs' }, { status: 500 });
  }
}

export async function GET_UNEXPORTED() {
  try {
    const db = await openDb();
    const unexportedTimeLogs = await db.all(
      'SELECT timeLogs.clientId, timeLogs.elapsed, timeLogs.notes, timeLogs.date, clients.name as client FROM timeLogs INNER JOIN clients ON timeLogs.clientId = clients.id WHERE timeLogs.exported = false'
    );

    return NextResponse.json(unexportedTimeLogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching unexported time logs:', error);
    return NextResponse.json({ error: 'Error fetching unexported time logs' }, { status: 500 });
  }
}
