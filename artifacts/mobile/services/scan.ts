import { api } from './api';

export interface ScannedCar {
  id: number;
  plate_number: string;
  make?: string;
  model?: string;
  color?: string;
}

export type AlertType = 'double_parked' | 'lights_on' | 'danger';

export function scanQrCode(qrCode: string): Promise<ScannedCar> {
  return api.get<ScannedCar>(`/api/scan/${qrCode}`, false);
}

export function sendAlert(
  qrCode: string,
  type: AlertType,
): Promise<{ message: string }> {
  return api.post(`/api/scan/${qrCode}/alerts`, { type }, false);
}
