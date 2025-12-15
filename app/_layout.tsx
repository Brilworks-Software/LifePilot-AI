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
    posthog.init(process.env.EXPO_PUBLIC_POST_HOG_AP_KEY || "", {
      api_host: 'https://us.i.posthog.com',
      autocapture: true,
        capture_pageview: false, // we’ll control pageview manually
    });

    return children;
  }

  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POST_HOG_API_KEY || ""}
      options={{ host: 'https://us.i.posthog.com' }}
    >
      {children}
    </PostHogProvider>
  );
};