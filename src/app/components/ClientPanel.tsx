'use client';

import { useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';

interface Client {
  id: number;
  name: string;
}

export default function ClientPanel({ selectedClient, setSelectedClient }: { selectedClient: { id: number; name: string } | null, setSelectedClient: (client: { id: number; name: string } | null) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [newClientName, setNewClientName] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const fetchedClients = await response.json();
        setClients(fetchedClients);
        setFilteredClients(fetchedClients);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    }
    fetchClients();
  }, []);

  const handleAddClient = async () => {
    if (newClientName.trim() === '') return;
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newClientName }),
      });
      if (!response.ok) {
        throw new Error('Failed to add client');
      }
      const newClient = await response.json();
      setClients([...clients, newClient]);
      setFilteredClients([...clients, newClient]);
      setSelectedClient(newClient);
    } catch (error) {
      console.error('Failed to add client', error);
      return;
    }
    setNewClientName('');
    setShowAddButton(false);
  };

  const handleExportUnexportedTimeLogs = async () => {
    try {
      const response = await fetch('/api/timers/exported', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unexported time logs');
      }
      const unexportedTimeLogs = await response.json();
      console.log('Unexported Time Logs:', unexportedTimeLogs);

      const csvContent = 'data:text/csv;charset=utf-8,' +
        unexportedTimeLogs.map((log: { client: string; elapsed: string; notes: string; date: string }) => `${log.client},${log.elapsed},${log.notes},${log.date}`).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'unexported_time_logs.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // After successful download, update exported status
      const updateResponse = await fetch('/api/timers/exported', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!updateResponse.ok) {
        throw new Error('Failed to update exported status');
      }
    } catch (error) {
      console.error('Failed to fetch or update unexported time logs', error);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      // Update the clients list after successful deletion
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      setFilteredClients(updatedClients);

      // Clear selected client if it is deleted
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Failed to delete client', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewClientName(value);
    setShowAddButton(value.trim() !== '' && clients.filter(client => client.name.toLowerCase().includes(value.toLowerCase().trim())).length === 0);
    setFilteredClients(clients.filter(client => client.name.toLowerCase().includes(value.toLowerCase().trim())));
  };

  return (
    <div className="flex flex-col w-1/3 p-6 bg-gray-100 rounded-l-lg relative">
      <div className="grow bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Clients</h2>
        <input
          type="text"
          value={newClientName}
          onChange={handleSearchChange}
          placeholder="Search or Add New"
          className="w-full p-2 mb-2 border rounded-md"
        />
        {showAddButton && (
          <button
            onClick={handleAddClient}
            className="w-full p-2 mb-4 bg-cyan-500 text-white rounded-md"
          >
            + Add Client
          </button>
        )}
        <div className="flex flex-col space-y-2">
          {filteredClients.map((client) => (
            <div key={client.id} className="flex items-center p-2 rounded-md bg-white">
              <button
                onClick={() => { setSelectedClient(client); setNewClientName(''); }}
                className={`flex-grow text-left p-2 rounded-md ${selectedClient?.id === client.id ? 'font-bold' : ''} hover:font-bold transition-all duration-200`}
              >
                {client.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClient(client.id);
                }}
                className="ml-2 p-1 text-gray-500 hover:text-red-700"
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        className="sticky bottom-0 w-full mt-4 p-2 border rounded-md text-cyan-500 border-cyan-500 hover:font-bold transition-all bg-gray-100"
        onClick={handleExportUnexportedTimeLogs}
      >
        Export Time Log
      </button>
    </div>
  );
}
