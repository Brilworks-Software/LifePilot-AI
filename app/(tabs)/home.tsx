import { StyleSheet, Text, View, Pressable, ActivityIndicator, ScrollView, useWindowDimensions, Platform } from 'react-native'
import React, { useEffect, useMemo, useRef } from 'react'
import { Container } from '@/components/Container'
import { useRouter } from 'expo-router';
import { useGeminiConfig } from '@/firebase/hooks/useGeminiConfig'
import { GeminiConfigData } from '@/firebase/types';
import { Sparkles, Wrench, Dumbbell, Brain, Calendar, ChevronRight } from 'lucide-react-native';
import { geminiConfigStore } from '@/store/GeminiConfigStore';

// Icon mapping for each option
const getIcon = (title: string) => {
  const iconMap: { [key: string]: any } = {
    'Astrology': Sparkles,
    'DIY Home Fix': Wrench,
    'Fitness Coach': Dumbbell,
    'Mental Wellness': Brain,
    'Scheduling & Productivity': Calendar,
  };
  
  return iconMap[title] || Sparkles;
};

// Color schemes for each option
const getColors = (title: string): [string, string] => {
  const colorMap: { [key: string]: [string, string] } = {
    'Astrology': ['#667eea', '#764ba2'],
    'DIY Home Fix': ['#f093fb', '#f5576c'],
    'Fitness Coach': ['#4facfe', '#00f2fe'],
    'Mental Wellness': ['#43e97b', '#38f9d7'],
    'Scheduling & Productivity': ['#fa709a', '#fee140'],
  };
  
  return colorMap[title] || ['#667eea', '#764ba2'];
};

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data: geminiConfig, isLoading, error } = useGeminiConfig()
  const isNavigatingRef = useRef(false);

  // Responsive layout calculations
  const isWeb = Platform.OS === 'web';
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  // Determine number of columns based on screen size
  const columns = useMemo(() => {
    if (isDesktop) return 3;
    if (isTablet) return 2;
    return 1;
  }, [isDesktop, isTablet]);


  // Calculate responsive sizes
  const containerMaxWidth = isWeb && isDesktop ? 1200 : width;
  const horizontalPadding = isMobile ? 16 : isTablet ? 24 : 32;
  const gap = isMobile ? 12 : 16;
  
  // Create options list from geminiConfig or use defaults
  const options = useMemo(() => {
    if (geminiConfig?.config && Array.isArray(geminiConfig.config)) {
      return geminiConfig.config.map(cfg => cfg.title)
    }
    return [
      'Astrology',
      'DIY Home Fix',
      'Fitness Coach',
      'Mental Wellness',
      'Scheduling & Productivity',
    ]
  }, [geminiConfig])

  const systemPromptMap = useMemo(() => {
    if (geminiConfig?.config && Array.isArray(geminiConfig.config)) {
      const map: { [key: string]: GeminiConfigData } = {};
      geminiConfig.config.forEach(cfg => {
        map[cfg.title] = cfg;
      });
      return map;
    }
    return {};
  }, [geminiConfig]);

  const handlePress = (option: string) => {
    // Prevent multiple navigations
    if (isNavigatingRef.current) {
      return;
    }
    
    // Set navigation flag to prevent multiple taps
    isNavigatingRef.current = true;
    
    console.log(option);
    geminiConfigStore.setConfig(systemPromptMap[option]);
    router.push({pathname: '/chatScreen'});
    
    // Reset navigation flag after a delay to allow navigation to complete
    // This prevents rapid taps from causing multiple navigations
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  }

  // Group options into rows based on columns
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < options.length; i += columns) {
      result.push(options.slice(i, i + columns));
    }
    return result;
  }, [options, columns]);

  if (isLoading) {
    return (
      <Container>
        <View style={[styles.centeredContainer, { maxWidth: containerMaxWidth, alignSelf: 'center', width: '100%' }]}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading assistants...</Text>
        </View>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <View style={[styles.centeredContainer, { maxWidth: containerMaxWidth, alignSelf: 'center', width: '100%' }]}>
          <Text style={styles.errorText}>Failed to load options</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth: containerMaxWidth, alignSelf: 'center', width: '100%' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.headerIconContainer}>
            <Sparkles size={isMobile ? 28 : 32} color="#667eea" strokeWidth={2.5} />
          </View>
          <Text style={[styles.headerTitle, { fontSize: isMobile ? 28 : isTablet ? 36 : 40 }]}>
            LifePilot AI
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: isMobile ? 14 : 16, maxWidth: isMobile ? '100%' : 600 }]}>
            Your personal AI assistant for every aspect of life
          </Text>
        </View>

        <View style={[styles.gridContainer, { paddingHorizontal: horizontalPadding, gap }]}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, { gap }]}>
              {row.map((opt) => {
                const Icon = getIcon(opt);
                const [color1, color2] = getColors(opt);
                
                return (
                  <Pressable
                    key={opt}
                    onPress={() => handlePress(opt)}
                    style={({ pressed, hovered }) => [
                      styles.card,
                      { flex: columns > 1 ? 1 : undefined },
                      isMobile && styles.cardMobile,
                      isTablet && styles.cardTablet,
                      isDesktop && styles.cardDesktop,
                      pressed && styles.cardPressed,
                      isWeb && hovered && styles.cardHovered,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={opt}
                    testID={`btn-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <View style={[
                      styles.cardContent,
                      isMobile ? styles.cardContentMobile : styles.cardContentDesktop
                    ]}>
                      <View style={[
                        styles.iconCircle,
                        { 
                          backgroundColor: color1 + '20',
                          width: isMobile ? 48 : 56,
                          height: isMobile ? 48 : 56,
                          borderRadius: isMobile ? 24 : 28,
                        }
                      ]}>
                        <Icon size={isMobile ? 24 : 28} color={color1} strokeWidth={2} />
                      </View>
                      
                      <View style={styles.textContainer}>
                        <Text style={[styles.cardTitle, { fontSize: isMobile ? 15 : 17 }]}>
                          {opt}
                        </Text>
                        <Text style={[styles.cardSubtitle, { fontSize: isMobile ? 12 : 13 }]}>
                          {isMobile ? 'Tap to chat' : 'Tap to start chatting'}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.arrowCircle,
                        { 
                          backgroundColor: color1 + '15',
                          width: isMobile ? 32 : 36,
                          height: isMobile ? 32 : 36,
                          borderRadius: isMobile ? 16 : 18,
                        }
                      ]}>
                        <ChevronRight size={isMobile ? 18 : 20} color={color1} strokeWidth={2.5} />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              {/* Add empty placeholders for last row if needed */}
              {columns > 1 && row.length < columns && 
                Array.from({ length: columns - row.length }).map((_, idx) => (
                  <View key={`placeholder-${idx}`} style={{ flex: 1 }} />
                ))
              }
            </View>
          ))}
        </View>

        <View style={[styles.footer, { paddingHorizontal: horizontalPadding, marginTop: isMobile ? 24 : 40 }]}>
          <Text style={styles.footerText}>Powered by Google Gemini AI</Text>
        </View>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerTitle: {
    fontWeight: '900',
    color: '#1a1a2e',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  gridContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  cardMobile: {
    width: '100%',
    minHeight: 88,
  },
  cardTablet: {
    minHeight: 96,
  },
  cardDesktop: {
    minHeight: 104,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.1,
    elevation: 5,
  },
  cardHovered: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderColor: '#e5e7eb',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardContentMobile: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardContentDesktop: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 4,
    minWidth: 0, // Enable text truncation
  },
  cardTitle: {
    color: '#1a1a2e',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  arrowCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
  },
  errorSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  footer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})