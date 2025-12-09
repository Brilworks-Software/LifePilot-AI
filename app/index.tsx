import { Stack, Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ActivityIndicator } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { sendMessageToGemini } from '@/services/gemini';
import { GeminiConfig } from '@/firebase/types';
import { useAuth } from '@/firebase/hooks/useAuth';

export default function Home() {
  const { currentUser: user} = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    
    // Prevent multiple navigation attempts
    if (isNavigating) return;

    // Use setTimeout to ensure navigation happens after layout is mounted
    const timer = setTimeout(() => {
      setIsNavigating(true);
      
      if (!user) {
        router.replace('/(auth)/login');
      } else {
        router.replace("/(tabs)/home");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, isNavigating]);

  


  // Show loading indicator while checking authentication or navigating
  if (!user || isNavigating) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Don't render content if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
      <Container>
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>

      </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  testButton: {
    marginTop: 16,
  },
  responseText: {
    marginHorizontal: 16,
    marginTop: 12,
    color: '#111827',
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 24,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
