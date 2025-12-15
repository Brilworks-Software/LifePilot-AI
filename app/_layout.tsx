import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { useScreenTracking } from '@/firebase/hooks/useScreenTracking';
import { useUserTracking } from '@/firebase/hooks/useUserTracking';
import { Platform } from 'react-native';
import posthog from 'posthog-js';
import {useScreenTracking as PostHogScreenTracking} from "@/posthog/useScreenTracking"

const queryClient = new QueryClient();

// Inner component that uses hooks requiring QueryClient
function AppContent() {
  // Automatically track screen changes
  useScreenTracking({
    enabled: true,
    debounce: false, // Set to true if you want to debounce rapid navigation changes
  });

  // Automatically sync user properties with analytics
  useUserTracking();
  PostHogScreenTracking();

  return (
    
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    
  );
}

export default function Layout() {
  return (
    <PostHogUniversalProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </PostHogUniversalProvider>
  );
}

export const PostHogUniversalProvider = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === 'web') {
    posthog.init('phc_KOO2AUb6Gx7bk7oz2xVsbBGTGAKVFQAHy9G5sE0Owka', {
      api_host: 'https://us.i.posthog.com',
      autocapture: true,
        capture_pageview: false, // we’ll control pageview manually
    });

    return children;
  }

  return (
    <PostHogProvider
      apiKey="phc_KOO2AUb6Gx7bk7oz2xVsbBGTGAKVFQAHy9G5sE0Owka"
      options={{ host: 'https://us.i.posthog.com' }}
    >
      {children}
    </PostHogProvider>
  );
};