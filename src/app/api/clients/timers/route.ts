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
    const { clientId, elapsed, startTime, endTime } = await req.json();

    if (!clientId || typeof elapsed !== 'number' || !startTime) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const db = await openDb();
    await db.run(
      'INSERT INTO timeLogs (clientId, startTime, endTime, elapsed) VALUES (?, ?, ?, ?)',
      clientId,
      startTime,
      endTime,
      elapsed
    );

    return new NextResponse('Timer data saved successfully', { status: 200 });
  } catch (error) {
    console.error('Error saving timer data:', error);
    return new NextResponse('Error saving timer data', { status: 500 });
  }
}
