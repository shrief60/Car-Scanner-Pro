import { api } from './api';
import type { Package, PaymentMethod, SubscribeResponse } from '@/types/subscriptions';

/**
 * Packages and subscriptions — `.claude/docs/api/subscriptions.md`.
 *
 * Unlike the merchant endpoints, these are live on the backend: `GET /api/packages`
 * answers 200 with the three documented tiers.
 */

/** Public — no bearer token needed, so it also works before the session is restored. */
export function listPackages(): Promise<Package[]> {
  return api.get<Package[]>('/api/packages', false);
}

export function subscribe(params: {
  packageId: number;
  paymentMethod: PaymentMethod;
}): Promise<SubscribeResponse> {
  return api.post<SubscribeResponse>('/api/subscriptions', {
    package_id: params.packageId,
    payment_method: params.paymentMethod,
  });
}
