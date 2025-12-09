import { StyleSheet, Text, View, FlatList, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import React, { useEffect, useMemo } from 'react';
import { AIConversation, GeminiConfigData } from '@/firebase/types';
import { Container } from '@/components/Container';
import { Stack, useRouter } from 'expo-router';
import { useConversationList } from '@/firebase/hooks/useAIConversations';
import { useAuth } from '@/firebase/hooks/useAuth';
import { ArrowLeft, Calendar, MessageCircle, Bot } from 'lucide-react-native'; // Added icons for better UI
import { useGeminiConfig } from '@/firebase/hooks/useGeminiConfig';
import { geminiConfigStore } from '@/store/GeminiConfigStore';

export default function History() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { data: conversations, isLoading, isError } = useConversationList(currentUser?.uid || "demoUserId");
    const { data: geminiConfig, error } = useGeminiConfig();

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

    if (isLoading) {
        return (
            <Container>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
            </Container>
        );
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp.seconds * 1000); // Assuming Firestore timestamp
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderItem = ({ item }: { item: AIConversation }) => {
        const firstMessage = item.messages[0];
        const messageCount = item.messages.length;
        const createdDate = formatDate(item.createdAt);
        const config = systemPromptMap[item.conversationType];

        return (
            <TouchableOpacity 
                style={styles.item} 
                onPress={() => {
                  geminiConfigStore.setConfig(config);
                  router.push({ pathname: '/chatScreen', params: {AIConversationRef: item.id } })
                }}
            >
                <View style={styles.itemHeader}>
                    <Bot size={20} color="#007AFF" style={styles.icon} />
                    <Text style={styles.title} numberOfLines={1}>
                        {firstMessage?.text || 'No messages'}
                    </Text>
                </View>
                <Text style={styles.subtitle} numberOfLines={2}>
                    {config?.description || item.conversationType}
                </Text>
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <Calendar size={14} color="#666" />
                        <Text style={styles.metaText}>{createdDate}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <MessageCircle size={14} color="#666" />
                        <Text style={styles.metaText}>{messageCount/2} messages</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Container>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (Platform.OS === 'web') {
                        window.history.back();
                    } else {
                        router.back();
                    }
                }}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>History</Text>
            </View>
            <View style={styles.container}>
                <FlatList
                    data={conversations}
                    keyExtractor={(c) => c.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MessageCircle size={64} color="#ccc" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No conversations yet</Text>
                            <Text style={styles.emptySubtitle}>Start a new chat to see your history here.</Text>
                        </View>
                    }
                />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 16, 
        paddingHorizontal: 16, 
        borderBottomWidth: 1, 
        borderColor: '#e0e0e0', 
        backgroundColor: '#fff' 
    },
    headerTitle: { fontSize: 24, fontWeight: '700', marginLeft: 16, color: '#000' },
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
    item: { 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3 
    },
    itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    icon: { marginRight: 8 },
    title: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
    metaContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    metaItem: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: 12, color: '#666', marginLeft: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    emptyIcon: { marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#000' },
    emptySubtitle: { textAlign: 'center', color: '#666', fontSize: 16 },
});
