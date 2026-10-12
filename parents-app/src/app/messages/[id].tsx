import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../../components/ParentLayout'; // Adjust relative path based on folder depth
import { supabase } from '../../services/supabase';
import { useTheme } from '@/hooks/use-theme';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ThreadDetails {
  teacherName: string;
  teacherRole: string;
  teacherAvatar?: string;
  studentName: string;
  className: string;
  subject: string;
}

const MessageDetailScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threadDetails, setThreadDetails] = useState<ThreadDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    let isMounted = true;

    const loadChatDetails = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) setIsLoading(false);
          return;
        }
        setCurrentUserId(session.user.id);

        // 1. Fetch thread info with teacher profile and student details
        const { data: threadData, error: threadErr } = await supabase
          .from('message_threads')
          .select(`
            subject,
            teacher:profiles!message_threads_teacher_id_fkey(first_name, last_name, avatar_url),
            student:students!message_threads_student_id_fkey(first_name, last_name, class_name)
          `)
          .eq('id', id)
          .single();

        if (threadErr || !threadData) {
          console.error('Error loading thread:', threadErr);
          if (isMounted) setIsLoading(false);
          return;
        }

        const teacherObj = threadData.teacher as unknown as { first_name?: string; last_name?: string; avatar_url?: string } | null;
        const studentObj = threadData.student as unknown as { first_name?: string; last_name?: string; class_name?: string } | null;

        if (isMounted) {
          setThreadDetails({
            teacherName: teacherObj ? `Mr./Ms. ${teacherObj.first_name || ''} ${teacherObj.last_name || ''}`.trim() : 'Teacher',
            teacherRole: threadData.subject || 'Class Teacher',
            teacherAvatar: teacherObj?.avatar_url || undefined,
            studentName: studentObj ? `${studentObj.first_name || ''} ${studentObj.last_name || ''}`.trim() : '',
            className: studentObj?.class_name || '',
            subject: threadData.subject || '',
          });
        }

        // 2. Fetch messages for this thread
        const { data: msgData, error: msgErr } = await supabase
          .from('messages')
          .select('*')
          .eq('thread_id', id)
          .order('created_at', { ascending: true });

        if (msgErr) console.error('Error fetching messages:', msgErr);

        if (msgData && isMounted) {
          const formattedMsgs: ChatMessage[] = msgData.map((m: Record<string, unknown>) => ({
            id: m.id as string,
            senderId: m.sender_id as string,
            content: m.content as string,
            timestamp: new Date(m.created_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: m.is_read as boolean,
          }));
          setMessages(formattedMsgs);
        }

        // 3. Mark unread messages sent to parent as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('thread_id', id)
          .neq('sender_id', session.user.id)
          .eq('is_read', false);

      } catch (err) {
        console.error('Error in chat detail load:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (id) {
      loadChatDetails();
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUserId || !id) return;

    const contentToSend = inputText.trim();
    setInputText('');

    try {
      setSending(true);
      const { data: newMsg, error } = await supabase
        .from('messages')
        .insert({
          thread_id: id,
          sender_id: currentUserId,
          content: contentToSend,
          is_read: false,
        })
        .select('*')
        .single();

      if (error || !newMsg) throw error;

      const addedMessage: ChatMessage = {
        id: newMsg.id,
        senderId: newMsg.sender_id,
        content: newMsg.content,
        timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: newMsg.is_read,
      };

      setMessages(prev => [...prev, addedMessage]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <ParentLayout activeTab="Messages">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading conversation...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="Messages">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1, backgroundColor: theme.background }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER BAR */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          borderBottomWidth: 1, 
          borderColor: theme.border,
          backgroundColor: theme.card 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {threadDetails?.teacherAvatar ? (
                <Image source={{ uri: threadDetails.teacherAvatar }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="person" size={18} color={theme.icon} />
              )}
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{threadDetails?.teacherName}</Text>
              <Text style={{ fontSize: 11, color: theme.icon }}>{threadDetails?.teacherRole}</Text>
            </View>
          </View>
        </View>

        {/* REGARDING SUB-BANNER */}
        {threadDetails?.studentName && (
          <View style={{ backgroundColor: theme.border + '40', paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: theme.icon, fontWeight: '600' }}>
              Regarding: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{threadDetails.studentName}</Text> {threadDetails.className ? `• ${threadDetails.className}` : ''}
            </Text>
          </View>
        )}

         {/* MESSAGE HISTORY SCROLLVIEW */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={{ flex: 1 }}
        >

          {messages.length === 0 ? (
            <Text style={{ textAlign: 'center', color: theme.icon, marginTop: 40, fontSize: 13 }}>No messages in this conversation yet. Say hello!</Text>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <View 
                  key={msg.id} 
                  style={{ 
                    flexDirection: 'row', 
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: 8,
                    marginBottom: 4
                  }}
                >
                  {!isMe && (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                      {threadDetails?.teacherAvatar ? (
                        <Image source={{ uri: threadDetails.teacherAvatar }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Ionicons name="person" size={14} color={theme.icon} />
                      )}
                    </View>
                  )}
                  <View 
                    style={{ 
                      maxWidth: '75%', 
                      backgroundColor: isMe ? theme.tint : theme.card,
                      borderWidth: isMe ? 0 : 1,
                      borderColor: theme.border,
                      borderRadius: 20,
                      borderBottomRightRadius: isMe ? 4 : 20,
                      borderBottomLeftRadius: isMe ? 20 : 4,
                      padding: 14,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: isMe ? '#ffffff' : theme.text, lineHeight: 20 }}>
                      {msg.content}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Text style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.8)' : theme.icon }}>
                        {msg.timestamp}
                      </Text>
                      {isMe && (
                        <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.9)" />
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* INPUT BAR */}
        <View style={{ 
          padding: 12, 
          backgroundColor: theme.card, 
          borderTopWidth: 1, 
          borderColor: theme.border, 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 10 
        }}>
          <TextInput
            placeholder="Write a message..."
            placeholderTextColor={theme.icon}
            value={inputText}
            onChangeText={setInputText}
            multiline
            style={{ 
              flex: 1, 
              backgroundColor: theme.background, 
              borderWidth: 1, 
              borderColor: theme.border, 
              borderRadius: 20, 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              maxHeight: 100, 
              fontSize: 14, 
              color: theme.text 
            }}
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={sending || !inputText.trim()}
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: inputText.trim() ? theme.tint : theme.border, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </ParentLayout>
  );
};

export default MessageDetailScreen;
