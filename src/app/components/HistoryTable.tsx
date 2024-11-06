'use client';

import { useEffect, useState } from 'react';

interface HistoryTableProps {
  selectedClientId: number;
  selectedClientName: string;
  setShowHistory: (value: boolean) => void;
}

interface TimeLogEntry {
  id: number;
  clientId: number;
  elapsed: string;
  notes: string;
  date: string;
}

export default function HistoryTable({ selectedClientId, selectedClientName, setShowHistory }: HistoryTableProps) {
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);

  useEffect(() => {
    const fetchTimeLogs = async () => {    
      console.log('Saving timer with data:', {
        clientId: selectedClientId,
        client: selectedClientName
      });
      try {
        const response = await fetch(`/api/timers?clientId=${selectedClientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch time logs');
        }
        const data: TimeLogEntry[] = await response.json();
        setTimeLogs(data);
      } catch (error) {
        console.error('Error fetching time logs:', error);
      }
    };

    if (selectedClientId) {
      fetchTimeLogs();
    }
  }, [selectedClientId]);

  return (
    <div className="w-2/3 p-6 bg-white rounded-r-lg flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-6">
        <h3 className="text-xl font-semibold text-gray-800">{selectedClientName}</h3>
      </div>
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr>
            <th className="border p-3 bg-cyan-700 text-white">Date</th>
            <th className="border p-3 bg-cyan-700 text-white">Hrs</th>
            <th className="border p-3 bg-cyan-700 text-white">Notes</th>
          </tr>
        </thead>
        <tbody>
          {timeLogs.length > 0 ? (
            timeLogs.map((log) => (
              <tr key={log.id} className="bg-gray-100">
                <td className="border p-3">{log.date}</td>
                <td className="border p-3">{log.elapsed}</td>
                <td className="border p-3">{log.notes}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border p-3 text-center" colSpan={3}>No records found</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex w-full justify-end space-x-4">
        <button
          className="mt-6 p-2 border rounded-md text-cyan-500 border-cyan-500"
          onClick={() => setShowHistory(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
