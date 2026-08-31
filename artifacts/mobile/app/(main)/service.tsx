import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ServiceMenuScreen } from '@/components/ServiceMenuScreen';
import { ServicePlaceholder } from '@/components/ServicePlaceholder';
import { SERVICE_ACTIVITY, SERVICE_INFO } from '@/constants/services';

/**
 * Dispatcher for the six home Services tiles.
 *
 * Tiles backed by real merchants (`maintenance`, `accessories`) get the browsing
 * screen; the rest keep the original static placeholder. `home.tsx` and its
 * `openService()` are untouched — one route, no extra entry in the back stack.
 */
export default function ServiceScreen() {
  const { service } = useLocalSearchParams<{ service: string }>();
  const key = service ?? 'maintenance';
  const activity = SERVICE_ACTIVITY[key] ?? null;

  if (activity) {
    const label = SERVICE_INFO[key]?.label ?? 'Services';
    return <ServiceMenuScreen activity={activity} label={label} />;
  }

  return <ServicePlaceholder service={key} />;
}
