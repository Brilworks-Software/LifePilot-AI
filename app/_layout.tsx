import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <PostHogProvider
      apiKey="phc_KOO2AUb6Gx7bk7oz2xVsbBGTGAKVFQAHy9G5sE0Owka"
      options={{
        host: 'https://us.i.posthog.com',
      }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
