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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await openDb();
    const clientId = params.id;

    // Execute delete query
    const result = await db.run('DELETE FROM clients WHERE id = ?', clientId);
    if (result.changes === 0) {
      return new NextResponse('Client not found', { status: 404 });
    }

    return new NextResponse('Client deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting client:', error);
    return new NextResponse('Error deleting client', { status: 500 });
  }
}
