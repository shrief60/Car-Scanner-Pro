import { api } from './api';

export interface Car {
  id: number;
  plate_number: string;
  make: string;
  model: string;
  color: string;
  qr_code: string;
  photo_url?: string;
  created_at?: string;
}

export interface CarsListResponse {
  data?: Car[];  // paginated
  // or just Car[] if not paginated — handle both
}

export async function listCars(): Promise<Car[]> {
  const res = await api.get<Car[] | { data: Car[] }>('/api/cars');
  // Handle both paginated { data: [] } and plain [] responses
  return Array.isArray(res) ? res : (res as { data: Car[] }).data ?? [];
}

export interface CreateCarParams {
  plate_number: string;
  make?: string;
  model?: string;
  color?: string;
  photo?: { uri: string; name: string; type: string };
}

export async function createCar(params: CreateCarParams): Promise<Car> {
  const form = new FormData();
  form.append('plate_number', params.plate_number);
  if (params.make) form.append('make', params.make);
  if (params.model) form.append('model', params.model);
  if (params.color) form.append('color', params.color);
  if (params.photo) {
    form.append('photo', {
      uri: params.photo.uri,
      name: params.photo.name,
      type: params.photo.type,
    } as unknown as Blob);
  }
  return api.postForm<Car>('/api/cars', form);
}

export function getCar(id: number): Promise<Car> {
  return api.get<Car>(`/api/cars/${id}`);
}

export function deleteCar(id: number): Promise<{ message: string }> {
  return api.del(`/api/cars/${id}`);
}
