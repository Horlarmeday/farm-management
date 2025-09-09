import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FarmContextType {
  selectedFarmId: string | null;
  setSelectedFarmId: (farmId: string | null) => void;
  isLoading: boolean;
  clearFarm: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

interface FarmProviderProps {
  children: ReactNode;
}

const FARM_STORAGE_KEY = 'selectedFarmId';

export const FarmProvider: React.FC<FarmProviderProps> = ({ children }) => {
  const [selectedFarmId, setSelectedFarmIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load farmId from localStorage on mount
  useEffect(() => {
    try {
      const storedFarmId = localStorage.getItem(FARM_STORAGE_KEY);
      if (storedFarmId) {
        setSelectedFarmIdState(storedFarmId);
      }
    } catch (error) {
      console.error('Error loading farmId from localStorage:', error);
      localStorage.removeItem(FARM_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSelectedFarmId = (farmId: string | null) => {
    setSelectedFarmIdState(farmId);
    
    if (farmId) {
      try {
        localStorage.setItem(FARM_STORAGE_KEY, farmId);
      } catch (error) {
        console.error('Error saving farmId to localStorage:', error);
      }
    } else {
      localStorage.removeItem(FARM_STORAGE_KEY);
    }
  };

  const clearFarm = () => {
    setSelectedFarmId(null);
  };

  const value: FarmContextType = {
    selectedFarmId,
    setSelectedFarmId,
    isLoading,
    clearFarm,
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmContext = (): FarmContextType => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarmContext must be used within a FarmProvider');
  }
  return context;
};

// Helper hook to get the current farm ID
export const useCurrentFarmId = (): string | null => {
  const { selectedFarmId } = useFarmContext();
  return selectedFarmId;
};

// Helper hook to check if user has selected a farm
export const useHasSelectedFarm = (): boolean => {
  const { selectedFarmId } = useFarmContext();
  return selectedFarmId !== null;
};