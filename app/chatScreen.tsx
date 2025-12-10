import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Modal,
  Image,
  Pressable,
  Platform,
  Alert,
  Clipboard,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Container } from '@/components/Container';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Message } from '@/firebase/types';
import {
  useConversation,
  useAppendMessageMutation,
  useCreateConversationMutation,
} from '@/firebase/hooks/useAIConversations';
import { sendMessageToGemini } from '@/services/gemini';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useUser } from '@/firebase/hooks/useUser';
import { pickImageToBase64 } from '@/services/imageConversationService';
import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import MobileMarkDown from '@/components/markdown/MobileMarkDownComponent';
import WebMarkDown from '@/components/markdown/WebMarkDownComponent';
import { ArrowLeft, Send, ImagePlus, Copy, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { geminiConfigStore } from '@/store/GeminiConfigStore';

// Enhanced Color palette
const COLORS = {
  primary: '#0084FF',
  userBubble: '#0084FF',
  modelBubble: '#F0F0F0',
  userText: '#FFFFFF',
  modelText: '#1C1C1E',
  border: '#E5E5EA',
  inputBg: '#FFF',
  header: '#FFF',
  background: '#FFFFFF',
  timestamp: '#8E8E93',
  success: '#34C759',
  shadow: '#000',
  avatarBg: '#E5E5EA',
  avatarAI: '#5856D6',
};

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const AIConversationRef = (params.AIConversationRef as string) || '';
  const AGENT_ROLE = geminiConfigStore.config;
  const router = useRouter();
  const [conversationRef, setConversationRef] = useState<string>(AIConversationRef || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [selectedImagebase64, setSelectedImagebase64] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedImageForView, setSelectedImageForView] = useState<string | null>(null);
  const idRef = useRef(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const getNextId = () => `msg-${idRef.current++}`;
  
  const role =
    AGENT_ROLE?.title && AGENT_ROLE
      ? AGENT_ROLE
      : {
          id: 'general',
          title: 'General Assistant',
          description: 'General-purpose assistant for miscellaneous questions.',
          systemPrompt: 'You are a helpful assistant.',
          examples: ['Tell me a quick tip.', 'Help me brainstorm ideas.'],
        };
  
  const { data: conversation, isLoading } = useConversation(AIConversationRef || '');
  const { currentUser: user } = useAuth();
  const { data: userData } = useUser(user?.uid || '');

  const appendMessageMutation = useAppendMessageMutation();
  const createConversationMutation = useCreateConversationMutation();

  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);

  useEffect(() => {
    setMessages(conversation?.messages || []);
  }, [conversation?.messages]);

  const onSendMessage = async () => {
    console.log(conversation?.id);
    if (isSending || inputText.trim() === '') return;
    setIsSending(true);
    let ref = conversationRef;
    
    if (conversationRef === '') {
      const newConv = await createConversationMutation.mutateAsync({
        userId: userData?.id || 'unknown',
        conversationType: AGENT_ROLE?.title || 'General Assistant',
      });
      setConversationRef(newConv.id);
      ref = newConv.id;
    }

    const userMessage: Message = {
      id: getNextId(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
      image: selectedImagebase64 || '',
    };
    setSelectedImagebase64('');

    const currentMessages = messages || [];
    const updatedThread = [...currentMessages, userMessage];
    setMessages(updatedThread);

    appendMessageMutation.mutate({
      conversationId: ref,
      messages: updatedThread,
    });

    const result = await sendMessageToGemini(
      updatedThread,
      inputText,
      {
        model: 'gemini-2.5-flash',
        systemInstruction: role.systemPrompt,
        temperature: 0.7,
      },
      selectedImagebase64 || ''
    );

    const modelMessage: Message = {
      id: getNextId(),
      role: 'model',
      text: result,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, modelMessage]);
    appendMessageMutation.mutate({
      conversationId: ref,
      messages: [...updatedThread, modelMessage],
    });

    setInputText('');
    setIsSending(false);
  };

  const handleImagePick = async () => {
    const base64Data = await pickImageToBase64();
    if (base64Data) {
      setSelectedImagebase64(base64Data);
      setModalVisible(true);
    }
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleCopyMessage = (text: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const handleImagePress = (imageBase64: string) => {
    setSelectedImageForView(imageBase64);
    setImageModalVisible(true);
  };

  // Enhanced typing indicator
  const TypingIndicator = () => {
    const dots = [
      useRef(new Animated.Value(0.3)).current,
      useRef(new Animated.Value(0.3)).current,
      useRef(new Animated.Value(0.3)).current,
    ];

    useEffect(() => {
      const animations = dots.map((dot, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 140),
            Animated.timing(dot, {
              toValue: 1,
              duration: 360,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 360,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );

      animations.forEach((anim) => anim.start());
      return () => animations.forEach((anim) => anim.stop());
    }, []);

    if (isLoading) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    return (
      <View style={styles.typingIndicator}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                opacity: d,
                transform: [{ scale: d }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Message Bubble Component with animations
  const MessageBubble = ({ msg, index }: { msg: Message; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // useEffect(() => {
    //   Animated.parallel([
    //     Animated.timing(fadeAnim, {
    //       toValue: 1,
    //       duration: 300,
    //       delay: index * 50,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(slideAnim, {
    //       toValue: 0,
    //       duration: 300,
    //       delay: index * 50,
    //       easing: Easing.out(Easing.cubic),
    //       useNativeDriver: true,
    //     }),
    //   ]).start();
    // }, []);

    return (
      <Animated.View
        style={[
          styles.messageBubbleContainer,
          msg.role === 'user' ? styles.userBubbleContainer : styles.modelBubbleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        {/* Avatar for AI messages */}
        {msg.role === 'model' && (
          <View style={styles.avatarContainer}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </View>
          </View>
        )}

        <View style={styles.messageContent}>
          <Pressable
            onLongPress={() => handleCopyMessage(msg.text)}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userBubble : styles.modelBubble,
            ]}>
            {msg.role === 'user' ? (
              <View>
                {msg.image ? (
                  <TouchableOpacity
                    onPress={() => handleImagePress(msg.image!)}
                    activeOpacity={0.9}>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${msg.image}` }}
                      style={styles.messageImage}
                    />
                  </TouchableOpacity>
                ) : null}
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ) : (
              <View style={styles.modelMessageContent}>
                {Platform.OS === 'web' ? (
                  <WebMarkDown text={msg.text} />
                ) : (
                  <MobileMarkDown text={msg.text} />
                )}
              </View>
            )}
          </Pressable>

          {/* Timestamp */}
          <View
            style={[
              styles.timestampContainer,
              msg.role === 'user' ? styles.userTimestamp : styles.modelTimestamp,
            ]}>
            <Text style={styles.timestampText}>{formatTime(msg.timestamp)}</Text>
            {msg.role === 'user' && (
              <Ionicons name="checkmark-done" size={14} color={COLORS.primary} style={styles.checkmark} />
            )}
          </View>
        </View>

        {/* Avatar for User messages */}
        {msg.role === 'user' && (
          <View style={styles.avatarContainer}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={16} color="#FFF" />
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="chatbubble-outline" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>{role.title}</Text>
      <Text style={styles.emptyStateDescription}>
        Start a conversation by asking a question
      </Text>
      {role.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Suggested questions:</Text>
          {role.examples.map((ex, i) => (
            <Pressable
              key={i}
              style={styles.exampleChip}
              onPress={() => {
                setInputText(ex);
              }}>
              <Text style={styles.exampleText}>{ex}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Container>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.history.back();
            } else {
              router.back();
            }
          }}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{role.title}</Text>
          {role.description && (
            <Text style={styles.headerDescription}>{role.description}</Text>
          )}
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={msg.id} msg={msg} index={index} />
            ))}
          </>
        )}
        {isSending && (
          <View
            style={[
              styles.messageBubbleContainer,
              styles.modelBubbleContainer,
            ]}>
            <View style={styles.avatarContainer}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#FFF" />
              </View>
            </View>
            <View style={[styles.messageBubble, styles.modelBubble]}>
              <TypingIndicator />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Image Preview Modal */}
      {selectedImagebase64 && modalVisible && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${selectedImagebase64}` }}
              style={styles.previewImage}
            />
            <Pressable
              onPress={() => {
                setSelectedImagebase64(null);
                setModalVisible(false);
              }}
              style={styles.removeImageButton}>
              <FontAwesome name="times" size={16} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.imagePreviewHint}>Ready to send with your message</Text>
        </View>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.fullScreenImageModal}>
          <TouchableOpacity
            style={styles.fullScreenImageBackdrop}
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${selectedImageForView}` }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeFullScreenButton}
              onPress={() => setImageModalVisible(false)}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* Image Upload Button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isSending && styles.iconButtonDisabled,
          ]}
          onPress={handleImagePick}
          disabled={isSending}
          accessibilityLabel="upload-image-button">
          <ImagePlus size={22} color={isSending ? '#CCC' : COLORS.primary} />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor="#999"
          style={styles.input}
          accessibilityLabel="chat-input"
          value={inputText}
          onChangeText={setInputText}
          editable={!isSending}
          onSubmitEditing={onSendMessage}
          returnKeyType="send"
          submitBehavior="blurAndSubmit"
          multiline
          maxLength={1000}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (isSending || inputText.trim() === '') && styles.sendButtonDisabled,
          ]}
          onPress={onSendMessage}
          disabled={isSending || inputText.trim() === ''}
          accessibilityLabel="send-button">
          <Send
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.header,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.2,
  },
  headerDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateIconContainer: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 21,
  },
  examplesContainer: {
    width: '100%',
    gap: 10,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exampleChip: {
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  messageBubbleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  modelBubbleContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
    marginBottom: 20,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.avatarAI,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  messageContent: {
    maxWidth: '75%',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: COLORS.modelBubble,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.userText,
    letterSpacing: 0.1,
  },
  modelMessageContent: {
    minWidth: 50,
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  userTimestamp: {
    justifyContent: 'flex-end',
  },
  modelTimestamp: {
    justifyContent: 'flex-start',
  },
  timestampText: {
    fontSize: 11,
    color: COLORS.timestamp,
    marginHorizontal: 2,
  },
  checkmark: {
    marginLeft: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 8,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  imagePreviewHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  fullScreenImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenImageBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
    maxHeight: 100,
    color: '#000',
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.5,
  },
});
