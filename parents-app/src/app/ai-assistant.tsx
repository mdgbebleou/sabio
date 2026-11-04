import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../context/StudentContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export default function AIAssistantScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ initialQuery?: string }>();
  const { selectedStudent } = useStudent();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I'm your Parent AI Support Assistant powered by local Ollama. How can I help you with ${selectedStudent ? selectedStudent.firstName : 'your child'} today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickChips = [
    "How are my child's grades?",
    "Check attendance status",
    "Compare my kids' progress",
    "Upcoming school fees?"
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInputText('');
    setLoading(true);

    try {
      const studentPayload = selectedStudent ? {
        name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        className: selectedStudent.className,
        academicAverage: selectedStudent.academicAverage,
        attendancePercentage: selectedStudent.attendancePercentage,
        outstandingBalance: selectedStudent.outstandingBalance,
        subjects: selectedStudent.subjects
      } : null;

      const systemPrompt = `
        You are an expert school management AI assistant talking directly to a parent in a mobile application.
        Provide helpful, friendly, and accurate insights based on the student's records context. Keep your response concise and structured.
      `;

      const promptBody = `
        [System Rules]: ${systemPrompt}
        [Student Records Context]: ${JSON.stringify(studentPayload)}
        [Parent Question]: ${textToSend}
      `;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('http://172.20.10.2:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3',
          prompt: promptBody,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      const aiReplyText = result?.response ? result.response.trim() : "I couldn't generate a response right now. Please try again.";

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Local AI intelligence layer is currently offline or taking too long to respond. Please check your Ollama backend connection.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.initialQuery) {
      void handleSendMessage(params.initialQuery);
    }
  }, [params?.initialQuery]);

  return (
    <ParentLayout activeTab="Home">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1, backgroundColor: theme.background }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER BAR */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text }}>Parent AI Support</Text>
              <Text style={{ fontSize: 11, color: theme.icon }}>Model: phi3 (Local Ollama)</Text>
            </View>
          </View>
        </View>

        {/* CHAT MESSAGES STREAM */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={{ flex: 1, padding: 16 }}
          contentContainerStyle={{ paddingBottom: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View 
                key={msg.id} 
                style={{ 
                  marginVertical: 6, 
                  alignItems: isUser ? 'flex-end' : 'flex-start' 
                }}
              >
                <View 
                  style={{ 
                    maxWidth: '85%',
                    backgroundColor: isUser ? theme.tint : theme.card,
                    borderWidth: isUser ? 0 : 1,
                    borderColor: theme.border,
                    borderRadius: 16,
                    padding: 14,
                    borderBottomRightRadius: isUser ? 4 : 16,
                    borderBottomLeftRadius: isUser ? 16 : 4,
                  }}
                >
                  <Text style={{ fontSize: 14, color: isUser ? '#ffffff' : theme.text, lineHeight: 20 }}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: theme.icon, marginTop: 4, marginHorizontal: 4 }}>
                  {msg.time}
                </Text>
              </View>
            );
          })}

          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 }}>
              <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 12 }}>
                <ActivityIndicator size="small" color={theme.tint} />
              </View>
              <Text style={{ fontSize: 12, color: theme.icon }}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* QUICK QUESTION PILLS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 8, maxHeight: 40 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {quickChips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSendMessage(chip)}
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: theme.tint }}>💬 {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* CHAT INPUT BAR */}
        <View style={{ padding: 16, borderTopWidth: 1, borderColor: theme.border, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 14,
              color: theme.text,
              maxHeight: 100,
            }}
            placeholder="Ask about your child's records..."
            placeholderTextColor={theme.icon}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() && !loading ? theme.tint : theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ParentLayout>
  );
}
