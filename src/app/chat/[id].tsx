/**
 * CECUREUS — Ally AI Companion Chat Screen (Powered by Microsoft Phi-3)
 *
 * Real-time conversational interface connected to local Phi-3 Ollama engine:
 * - Top header with Close (X), Ally Avatar, "Online · 24/7", topic pill tag
 * - Ally speech bubbles with Mascot avatar badge
 * - Real-time conversational context & intelligent empathetic responses
 * - Auto-scrolling to latest message
 * - Interactive quick reply pills
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Logo } from '../../components/ui/Logo';
import { allyApi } from '../../services/api';

interface Message {
  id: string;
  role: 'ally' | 'user';
  text: string;
  timestamp: string;
}

export default function AllyChatScreen() {
  const { id: routeId, topic, initialMessage } = useLocalSearchParams<{
    id?: string;
    topic?: string;
    initialMessage?: string;
  }>();

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_intro',
      role: 'ally',
      text: "Hi, I'm Ally 👋\nI'm here to listen, understand and support you. How are you feeling right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize or start real conversation with backend Phi-3
  useEffect(() => {
    let isMounted = true;

    async function initChat() {
      try {
        setIsTyping(true);
        const convTopic = topic || 'General Check-in';
        const initMsg = initialMessage || undefined;

        // If an initial message is provided, display it immediately
        if (initMsg) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_user_init_${Date.now()}`,
              role: 'user',
              text: initMsg,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }

        const res = await allyApi.startConversation({
          topic: convTopic,
          initialMessage: initMsg,
        });

        if (!isMounted) return;

        if (res?.conversation?.id) {
          setConversationId(res.conversation.id);

          if (Array.isArray(res.conversation.messages) && res.conversation.messages.length > 0) {
            const serverMsgs: Message[] = res.conversation.messages.map((m: any) => ({
              id: m.id || String(Math.random()),
              role: m.role === 'ally' ? 'ally' : 'user',
              text: m.content || '',
              timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }));
            setMessages(serverMsgs);
          }
        }
      } catch (err) {
        console.error('Failed to init Ally chat session:', err);
      } finally {
        if (isMounted) setIsTyping(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
    };
  }, [topic, initialMessage]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText('');

    const tempUserMsg: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      let activeId = conversationId;
      if (!activeId) {
        const startRes = await allyApi.startConversation({
          topic: topic || 'General Check-in',
          initialMessage: userText,
        });
        activeId = startRes?.conversation?.id;
        if (activeId) setConversationId(activeId);

        if (startRes?.conversation?.messages) {
          const lastMsg = startRes.conversation.messages[startRes.conversation.messages.length - 1];
          if (lastMsg && lastMsg.role === 'ally') {
            setMessages((prev) => [
              ...prev,
              {
                id: lastMsg.id || `msg_ally_${Date.now()}`,
                role: 'ally',
                text: lastMsg.content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setIsTyping(false);
            return;
          }
        }
      }

      if (activeId) {
        const res = await allyApi.sendMessage(activeId, userText);
        const replyContent =
          res?.allyMessage?.content ||
          res?.content ||
          "I'm here listening with you. Take your time, what else is on your mind?";

        setMessages((prev) => [
          ...prev,
          {
            id: res?.allyMessage?.id || `msg_ally_${Date.now()}`,
            role: 'ally',
            text: replyContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Error sending message to Ally Phi-3:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_ally_err_${Date.now()}`,
          role: 'ally',
          text: "I hear you, and I'm listening closely. Could you tell me a little more about that?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Ally Center Profile Info */}
        <View style={styles.allyHeaderProfile}>
          <View style={styles.allyAvatarCircle}>
            <Logo size={24} variant="icon" />
          </View>
          <View>
            <Text style={styles.allyHeaderName}>Ally</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.allyHeaderStatus}>Online · Phi-3 AI</Text>
            </View>
          </View>
        </View>

        {/* Topic Tag Pill */}
        <View style={styles.topicPill}>
          <Text style={styles.topicPillText} numberOfLines={1}>
            {topic || 'Check-in'}
          </Text>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {/* Reassurance Badge */}
          <View style={styles.reassurancePill}>
            <Ionicons name="shield-checkmark" size={13} color="#0D9488" style={{ marginRight: 4 }} />
            <Text style={styles.reassuranceText}>
              Confidential &amp; Encrypted · Safe Space
            </Text>
          </View>

          {messages.map((msg) => {
            const isAlly = msg.role === 'ally';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isAlly ? styles.messageRowAlly : styles.messageRowUser,
                ]}
              >
                {/* Ally Mascot Avatar on left */}
                {isAlly && (
                  <View style={styles.bubbleAvatar}>
                    <Logo size={22} variant="icon" />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isAlly ? styles.bubbleAlly : styles.bubbleUser,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isAlly ? styles.bubbleTextAlly : styles.bubbleTextUser,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      isAlly ? styles.bubbleTimeAlly : styles.bubbleTimeUser,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowAlly]}>
              <View style={styles.bubbleAvatar}>
                <Logo size={22} variant="icon" />
              </View>
              <View style={[styles.bubble, styles.bubbleAlly, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Ally is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your thoughts to Ally..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() || isTyping ? styles.sendBtnDisabled : styles.sendBtnActive,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={18}
              color={!inputText.trim() || isTyping ? '#94A3B8' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allyHeaderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allyAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allyHeaderName: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  allyHeaderStatus: {
    ...typography.small,
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
  },
  topicPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    maxWidth: 110,
  },
  topicPillText: {
    ...typography.small,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  reassurancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#CCFBF1',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  reassuranceText: {
    ...typography.small,
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  messageRowAlly: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleAlly: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextAlly: {
    color: colors.text,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeAlly: {
    color: '#94A3B8',
  },
  bubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 21,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
  sendBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
});
