'use client';

import { useState, useEffect } from 'react';

interface TimerContainerProps {
  selectedClient: { id: number, name: string } | null;
  setShowHistory: (value: boolean) => void;
}

export default function TimerContainer({ selectedClient, setShowHistory }: TimerContainerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Effect to track timer progress
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRunning) {
      timer = setInterval(() => {
        if (startTime !== null) {
          setElapsedTime(Date.now() - startTime);
        }
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, startTime]);

  // Reset timer when selected client changes
  useEffect(() => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    const notesTextarea = document.querySelector('textarea');
    if (notesTextarea) notesTextarea.value = '';
  }, [selectedClient]);

  // Handle start/stop button click
  const handleStartStop = () => {
    if (isRunning) {
      // Stop the timer
      setIsRunning(false);
      setStartTime(null);
    } else {
      // Start the timer without adding 6 minutes if time is already recorded
      const newElapsedTime = elapsedTime === 0 ? elapsedTime + 6 * 60 * 1000 : elapsedTime;
      setElapsedTime(newElapsedTime);
      setStartTime(Date.now() - newElapsedTime);
      setIsRunning(true);
    }
  };

  // Format elapsed time into hours
  const formatElapsedTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 1000 / 60 / 60 * 10) / 10;
    return `${hours.toFixed(1)} hrs`;
  };

  const handleSave = async () => {
    if (!selectedClient) {
      alert('Please select a client first.');
      return;
    }

    const notes = document.querySelector('textarea')?.value || '';

    try {
      const response = await fetch('/api/timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          elapsed: formatElapsedTime(elapsedTime),
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save timer data');
      }

      alert('Timer data saved successfully');
      // Reset the timer after saving
      setIsRunning(false);
      setElapsedTime(0);
      setStartTime(null);
      const notesTextarea = document.querySelector('textarea');
      if (notesTextarea) notesTextarea.value = '';
    } catch (error) {
      console.error('Error saving timer data:', error);
    }
  };

  // Calculate progress percentage for the progress bar
  const calculateProgress = (milliseconds: number) => {
    const minutes = (milliseconds / 1000 / 60) % 6;
    return (minutes / 6) * 100;
  };

  return (
    <div className="w-2/3 p-6 bg-white rounded-r-lg flex flex-col items-center">
      {selectedClient ? (
        <>
          <div className="flex items-center justify-between w-full mb-6">
            <h3 className="text-xl font-semibold text-gray-800">{selectedClient.name}</h3>
            <button
              onClick={handleStartStop}
              className={`p-2 rounded-md ${isRunning ? 'bg-red-500 text-white' : 'bg-cyan-500 text-white'} transition-all`}
            >
              {isRunning ? 'Stop' : 'Start'}
            </button>
          </div>
          <div className={`relative w-full flex flex-col items-center p-6 rounded-lg shadow-md mb-4 bg-white`}>
            {/* Timer Display */}
            <p className={`text-4xl font-semibold ${isRunning ? 'text-cyan-500 animate-pulse' : 'text-gray-800'} mb-2`}>
              {formatElapsedTime(elapsedTime)}
            </p>
            {/* Progress Bar */}
            {isRunning && (
              <div className="w-full h-0.5 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-cyan-200 rounded-full transition-all"
                  style={{ width: `${calculateProgress(elapsedTime)}%` }}
                ></div>
              </div>
            )}
          </div>
          {/* Notes Section */}
          <div className="w-full flex flex-col items-center bg-white p-4 rounded-lg shadow-md mb-4">
            <textarea
              placeholder="Add notes..."
              className="w-full p-2 rounded-md focus:outline-none focus:border-cyan-500"
            ></textarea>
          </div>
          <div className="flex w-full justify-end space-x-4">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-1 text-cyan-500 border border-cyan-500 px-4 py-2 rounded-md hover:font-bold transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              <span>History</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 text-cyan-500 border border-cyan-500 px-4 py-2 rounded-md hover:font-bold transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Save</span>
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-full p-4 bg-gray-100 border border-gray-300 rounded-md flex justify-center items-center">
          <p className="text-cyan-800 font-semibold text-lg">Select a client to start tracking time.</p>
        </div>
      )}
    </div>
  );
}
