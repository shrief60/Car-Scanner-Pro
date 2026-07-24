import React, { createContext, useContext, useState } from 'react';
import {
  Car,
  CreateCarParams,
  listCars,
  createCar,
  deleteCar as deleteCarApi,
} from '@/services/cars';

export type { Car };

interface CarsContextType {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
  fetchCars: () => Promise<void>;
  addCar: (params: CreateCarParams) => Promise<Car>;
  removeCar: (id: number) => Promise<void>;
}

const CarsContext = createContext<CarsContextType | null>(null);

export function CarsProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCars() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCars();
      setCars(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function addCar(params: CreateCarParams): Promise<Car> {
    const car = await createCar(params);
    setCars(prev => [car, ...prev]);
    return car;
  }

  async function removeCar(id: number) {
    await deleteCarApi(id);
    setCars(prev => prev.filter(c => c.id !== id));
  }

  return (
    <CarsContext.Provider
      value={{ cars, isLoading, error, fetchCars, addCar, removeCar }}
    >
      {children}
    </CarsContext.Provider>
  );
}

export function useCars() {
  const ctx = useContext(CarsContext);
  if (!ctx) throw new Error('useCars must be inside CarsProvider');
  return ctx;
}
