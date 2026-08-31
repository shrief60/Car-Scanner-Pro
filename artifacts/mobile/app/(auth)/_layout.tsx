import { Stack } from 'expo-router';
import { stackAnimation } from '@/lib/direction';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Direction-aware — a hardcoded slide_from_right pushes in from the wrong
        // side in Arabic on Android.
        animation: stackAnimation(),
        contentStyle: { backgroundColor: '#082926' },
      }}
    />
  );
}
