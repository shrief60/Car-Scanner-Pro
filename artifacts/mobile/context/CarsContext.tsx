import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Car {
  id: string;
  plate: string;
  type: string;
  color: string;
  createdAt: number;
}

interface CarsContextType {
  cars: Car[];
  addCar: (car: Omit<Car, 'id' | 'createdAt'>) => Promise<Car>;
  getCar: (id: string) => Car | undefined;
  isLoading: boolean;
}

const CarsContext = createContext<CarsContextType | null>(null);
const CARS_KEY = '@qar_cars';

export function CarsProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  async function loadCars() {
    try {
      const stored = await AsyncStorage.getItem(CARS_KEY);
      if (stored) setCars(JSON.parse(stored));
    } finally {
      setIsLoading(false);
    }
  }

  async function addCar(data: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
    const car: Car = {
      ...data,
      id:
        Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    const updated = [car, ...cars];
    await AsyncStorage.setItem(CARS_KEY, JSON.stringify(updated));
    setCars(updated);
    return car;
  }

  function getCar(id: string) {
    return cars.find(c => c.id === id);
  }

  return (
    <CarsContext.Provider value={{ cars, addCar, getCar, isLoading }}>
      {children}
    </CarsContext.Provider>
  );
}

export function useCars() {
  const ctx = useContext(CarsContext);
  if (!ctx) throw new Error('useCars must be inside CarsProvider');
  return ctx;
}
