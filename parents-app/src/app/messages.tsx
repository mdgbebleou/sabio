import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';

interface MessageThread {
  id: string;
  senderName: string;
  senderRole: string;
  avatarUrl?: string;
  regardingText: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  category: 'teacher' | 'school';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

const MessagesScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Announcements' | 'Teachers' | 'School'>('All');
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<Announcement | null>(null);
  const [threads, setThreads] = useState<MessageThread[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadMessagesData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // 1. Fetch Pinned Announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_pinned', true)
          .limit(1)
          .maybeSingle();

        if (annData && isMounted) {
          setPinnedAnnouncement({
            id: annData.id,
            title: annData.title,
            content: annData.content,
            date: new Date(annData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }

        // 2. Fetch Message Threads joined with Teacher Profile and Student Info
        const { data: threadData, error: threadError } = await supabase
          .from('message_threads')
          .select(`
            id,
            subject,
            last_message_at,
            teacher:profiles!message_threads_teacher_id_fkey(first_name, last_name, avatar_url),
            student:students!message_threads_student_id_fkey(first_name, class_name)
          `)
          .eq('parent_id', session.user.id)
          .order('last_message_at', { ascending: false });

        if (threadError) {
          console.error('Error fetching message threads:', threadError);
        }

        if (threadData && isMounted) {
          const formattedThreads: MessageThread[] = [];

          for (const thread of threadData) {
            // Fetch the latest message for this thread
            const { data: latestMsg } = await supabase
              .from('messages')
              .select('content, created_at, is_read, sender_id')
              .eq('thread_id', thread.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Check if there are any unread messages sent by the teacher (not the parent)
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('thread_id', thread.id)
              .eq('is_read', false)
              .neq('sender_id', session.user.id);

            const teacherObj = thread.teacher as unknown as { first_name?: string; last_name?: string; avatar_url?: string } | null;
            const studentObj = thread.student as unknown as { first_name?: string; class_name?: string } | null;

            const teacherName = teacherObj ? `${teacherObj.first_name || ''} ${teacherObj.last_name || ''}`.trim() : 'Class Teacher';
            const studentName = studentObj?.first_name ? studentObj.first_name : '';
            const className = studentObj?.class_name ? studentObj.class_name : '';

            // Construct smart tag for multi-child clarity (e.g. "Teacher • Ama's Class (Class 6)")
            const regardingTag = studentName 
              ? `${studentName}'s Teacher${className ? ` (${className})` : ''}` 
              : thread.subject || 'Class Teacher';

            formattedThreads.push({
              id: thread.id,
              senderName: teacherName || 'School Staff',
              senderRole: regardingTag,
              avatarUrl: teacherObj?.avatar_url || undefined,
              regardingText: thread.subject || '',
              lastMessage: latestMsg?.content || 'No messages yet.',
              timestamp: latestMsg ? new Date(latestMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              unread: (unreadCount ?? 0) > 0,
              category: 'teacher',
            });
          }

          setThreads(formattedThreads);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMessagesData();
    return () => { isMounted = false; };
  }, []);

  const filteredThreads = threads.filter(t => {
    if (activeFilter === 'Announcements') return false;
    if (activeFilter === 'Teachers') return t.category === 'teacher';
    if (activeFilter === 'School') return t.category === 'school';
    return true;
  });

  if (loading) {
    return (
      <ParentLayout activeTab="Messages">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading messages...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="Messages">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER & COMPOSE BUTTON */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text }}>Messages</Text>
          <TouchableOpacity 
            onPress={() => router.push('/messages/new' as any)}
            style={{ backgroundColor: theme.tint, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Ionicons name="create-outline" size={16} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>New Message</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['All', 'Announcements', 'Teachers', 'School'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: activeFilter === tab ? theme.tint : theme.card,
                  borderWidth: 1,
                  borderColor: activeFilter === tab ? theme.tint : theme.border,
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 13, color: activeFilter === tab ? '#ffffff' : theme.text }}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* PINNED ANNOUNCEMENT */}
        {(activeFilter === 'All' || activeFilter === 'Announcements') && pinnedAnnouncement && (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: theme.tint }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="pin" size={14} color={theme.tint} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.tint, letterSpacing: 0.5 }}>PINNED ANNOUNCEMENT</Text>
              </View>
              <Text style={{ fontSize: 11, color: theme.icon }}>{pinnedAnnouncement.date}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{pinnedAnnouncement.title}</Text>
            <Text style={{ fontSize: 13, color: theme.icon, lineHeight: 18, marginBottom: 12 }}>{pinnedAnnouncement.content}</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.tint }}>Read Full Notice →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* THREADS LIST */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 12 }}>
          {filteredThreads.length === 0 ? (
            <Text style={{ textAlign: 'center', color: theme.icon, padding: 30, fontSize: 13 }}>No messages found.</Text>
          ) : (
            filteredThreads.map((thread, index) => (
              <TouchableOpacity
                key={thread.id}
                onPress={() => router.push(`/messages/${thread.id}` as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderBottomWidth: index < filteredThreads.length - 1 ? 1 : 0,
                  borderColor: theme.border,
                  gap: 12
                }}
              >
                {thread.unread && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.tint }} />
                )}
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                  {thread.avatarUrl ? (
                    <Image source={{ uri: thread.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Ionicons name="person" size={20} color={theme.icon} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>{thread.senderName}</Text>
                    <Text style={{ fontSize: 11, color: theme.icon }}>{thread.timestamp}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: theme.tint, fontWeight: '600', marginTop: 2 }}>{thread.senderRole} {thread.regardingText ? `• ${thread.regardingText}` : ''}</Text>
                  <Text style={{ fontSize: 12, color: theme.icon, marginTop: 4 }} numberOfLines={1}>"{thread.lastMessage}"</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </ParentLayout>
  );
};

export default MessagesScreen;
