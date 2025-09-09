import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataRoomContextType {
  resetCounter: number;
  triggerGlobalReset: () => void;
  isResetting: boolean;
  setIsResetting: (resetting: boolean) => void;
}

const DataRoomContext = createContext<DataRoomContextType | undefined>(undefined);

export function DataRoomProvider({ children }: { children: ReactNode }) {
  const [resetCounter, setResetCounter] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const triggerGlobalReset = () => {
    setResetCounter(prev => prev + 1);
  };

  return (
    <DataRoomContext.Provider 
      value={{ 
        resetCounter, 
        triggerGlobalReset, 
        isResetting, 
        setIsResetting 
      }}
    >
      {children}
    </DataRoomContext.Provider>
  );
}

export function useDataRoom() {
  const context = useContext(DataRoomContext);
  if (context === undefined) {
    throw new Error('useDataRoom must be used within a DataRoomProvider');
  }
  return context;
}