import { /*NextRequest,*/ NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'src', 'app', 'data', 'timerTracker.db'),
    driver: sqlite3.Database,
  });
}

export async function GET() {
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


export async function PUT() {
  try {
    const db = await openDb();
    await db.run('UPDATE timeLogs SET exported = true WHERE exported = false');

    return NextResponse.json({ message: 'All unexported time logs have been updated to exported' }, { status: 200 });
  } catch (error) {
    console.error('Error updating exported status:', error);
    return NextResponse.json({ error: 'Error updating exported status' }, { status: 500 });
  }
}
