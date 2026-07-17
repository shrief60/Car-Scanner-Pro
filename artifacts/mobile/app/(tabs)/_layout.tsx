import { Redirect } from 'expo-router';

// Redirect legacy tabs route to main app
export default function TabsLayout() {
  return <Redirect href="/(main)/home" />;
}
