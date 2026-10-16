import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingPlatform, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../context/StudentContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIAssistantScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ initialQuery?: string }>();
  const { selectedStudent, setSelectedStudent, linkedStudents } = useStudent();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  
  // Target focus can be a specific student or "all" for comparison
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chat with welcome message or incoming initial query from dashboard chips
  useEffect(() => {
    const initialGreeting: Message = {
      id: '1',
      role: 'assistant',
      content: `Hello! I am your Sabio Parent AI Support Assistant. I'm currently reviewing records for ${selectedStudent ? `${selectedStudent.firstName}${selectedStudent.lastName}` : 'your wards'}. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (params?.initialQuery) {
      const userQueryMsg: Message = {
        id: '0',
        role: 'user',
        content: params.initialQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialGreeting, userQueryMsg]);
      // Automatically send the query to the backend
      void handleSendMessage(params.initialQuery);
    } else {
      setMessages([initialGreeting]);
    }
  }, [selectedStudent]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Build context payload for Gemini / OpenAI backend
      const studentPayload = comparisonMode 
        ? linkedStudents.map(s => ({
            name: `${s.firstName} ${s.lastName}`,
            className: s.className,
            academicAverage: s.academicAverage,
            attendancePercentage: s.attendancePercentage,
            outstandingBalance: s.outstandingBalance
          }))
        : selectedStudent ? {
            name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            className: selectedStudent.className,
            academicAverage: selectedStudent.academicAverage,
            attendancePercentage: selectedStudent.attendancePercentage,
            outstandingBalance: selectedStudent.outstandingBalance
          } : null;

      const response = await supabase.functions.invoke('generate-insights', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: {
          appType: 'parent',
          moduleName: comparisonMode ? 'student-comparison' : 'interactive-chat',
          userPrompt: query,
          studentContext: studentPayload
        }
      });

      const { data, error } = response;
      if (error) throw error;

      const botReplyText = data?.success && data?.insights 
        ? data.insights 
        : 'I am having trouble processing that request right now. Please try again.';

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, the AI assistant layer is temporarily offline. Please check your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      
      {/* HEADER WITH BACK BUTTON & TITLE */}
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, 
        backgroundColor: theme.card, borderBottomWidth: 1, borderColor: theme.border 
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border }}>
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Parent AI Assistant</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* CONTEXT BANNER (Active Ward / Comparison Mode) */}
      <TouchableOpacity
        onPress={() => setIsChildSelectorOpen(true)}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: theme.card, paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderColor: theme.border
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.tint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="sparkles" size={14} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.icon, fontWeight: '600' }}>Focus Context:</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
              {comparisonMode ? 'Comparing All Wards' : (selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'No Ward Selected')}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.background, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.tint }}>Switch</Text>
          <Ionicons name="chevron-down" size={12} color={theme.tint} />
        </View>
      </TouchableOpacity>

      {/* CHAT STREAM MESSAGE BUBBLES */}
      <ScrollView 
        ref={scrollViewRef}
        onContentChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 30 }}
        style={{ flex: 1 }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <View 
              key={msg.id} 
              style={{ 
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: isUser ? theme.tint : theme.card,
                borderWidth: isUser ? 0 : 1,
                borderColor: theme.border,
                borderRadius: 20,
                borderTopRightRadius: isUser ? 4 : 20,
                borderTopLeftRadius: isUser ? 20 : 4,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                elevation: 1
              }}
            >
              <Text style={{ fontSize: 14, color: isUser ? '#ffffff' : theme.text, lineHeight: 22, fontWeight: '500' }}>
                {msg.content}
              </Text>
              <Text style={{ fontSize: 9, color: isUser ? 'rgba(255,255,255,0.7)' : theme.icon, alignSelf: 'flex-end', marginTop: 6 }}>
                {msg.timestamp}
              </Text>
            </View>
          );
        })}

        {isSending && (
          <View style={{ alignSelf: 'flex-start', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color={theme.tint} />
            <Text style={{ fontSize: 12, color: theme.icon, fontStyle: 'italic' }}>AI is analyzing records...</Text>
          </View>
        )}
      </ScrollView>

      {/* PERSISTENT STICKY INPUT BAR */}
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', gap: 10, 
        padding: 16, backgroundColor: theme.card, borderTopWidth: 1, borderColor: theme.border,
        marginBottom: Platform.OS === 'ios' ? 20 : 0
      }}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask anything about your ward..."
          placeholderTextColor={theme.icon}
          style={{ 
            flex: 1, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border,
            borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: theme.text,
            maxHeight: 100
          }}
          multiline
        />
        <TouchableOpacity
          onPress={() => handleSendMessage()}
          disabled={isSending || !inputText.trim()}
          style={{ 
            width: 44, height: 44, borderRadius: 22, backgroundColor: inputText.trim() ? theme.tint : theme.border,
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* SELECT FOCUS CONTEXT MODAL */}
      <Modal
        visible={isChildSelectorOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChildSelectorOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
            <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, marginBottom: 20 }} />

            <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text, marginBottom: 6 }}>Select AI Focus</Text>
            <Text style={{ fontSize: 13, color: theme.icon, marginBottom: 20 }}>Choose a single child or compare all wards together.</Text>

            <TouchableOpacity
              onPress={() => {
                setComparisonMode(true);
                setIsChildSelectorOpen(false);
              }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20,
                borderWidth: comparisonMode ? 2 : 1, borderColor: comparisonMode ? theme.tint : theme.border,
                backgroundColor: theme.card, marginBottom: 12
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="people" size={18} color="#1d4ed8" />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>Compare All Wards</Text>
                <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>Analyze academic & attendance side-by-side</Text>
              </View>
            </TouchableOpacity>

            {linkedStudents.map((child) => {
              const isSelected = !comparisonMode && selectedStudent?.id === child.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => {
                    setSelectedStudent(child);
                    setComparisonMode(false);
                    setIsChildSelectorOpen(false);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    padding: 16, borderRadius: 20, borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? theme.tint : theme.border, backgroundColor: theme.card, marginBottom: 8
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                      {child.avatarUrl ? (
                        <Image source={{ uri: child.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 14 }}>
                          {child.firstName.slice(0, 1)}{child.lastName.slice(0, 1)}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                        {child.firstName} {child.lastName}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{child.className}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default AIAssistantScreen;
