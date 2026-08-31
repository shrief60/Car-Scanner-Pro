import { useAuth } from '@/context/AuthContext';
import { AppShellSkeletonScreen } from '@/components/AppShellSkeleton';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Hydrating the session from AsyncStorage. This is the first screen after a language
  // switch restarts the app, so it shows the app's silhouette rather than a spinner on
  // an empty background — the restart should look like Qar loading, not like a stall.
  if (isLoading) return <AppShellSkeletonScreen />;

  if (isAuthenticated) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
