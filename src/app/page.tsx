'use client';

import ClientPanel from './components/ClientPanel';
import TimerContainer from './components/TimerContainer';
import HistoryTable from './components/HistoryTable';
import { useState } from 'react';

export default function Home() {
  const [selectedClient, setSelectedClient] = useState<{ id: number; name: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex w-[900px] bg-white text-black rounded-lg shadow-lg overflow-hidden">
      <ClientPanel selectedClient={selectedClient} setSelectedClient={setSelectedClient} />
      {showHistory && selectedClient ? (
        <HistoryTable selectedClientId={selectedClient.id} selectedClientName={selectedClient.name} setShowHistory={setShowHistory} />
      ) : (
        <TimerContainer selectedClient={selectedClient} setShowHistory={setShowHistory} />
      )}
    </div>
  );
}
