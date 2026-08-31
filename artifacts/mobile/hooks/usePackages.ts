import { useMutation, useQuery } from '@tanstack/react-query';
import { listPackages, subscribe } from '@/services/subscriptions';
import type { PaymentMethod } from '@/types/subscriptions';

export const subscriptionKeys = {
  packages: () => ['subscriptions', 'packages'] as const,
};

/** The three tiers. Small, static, and public — cached for the session. */
export function usePackages() {
  return useQuery({
    queryKey: subscriptionKeys.packages(),
    queryFn: listPackages,
    staleTime: 60 * 60_000,
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (params: { packageId: number; paymentMethod: PaymentMethod }) =>
      subscribe(params),
  });
}
