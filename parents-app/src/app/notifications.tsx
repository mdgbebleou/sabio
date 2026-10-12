import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  isImportant: boolean;
  type: string;
  route?: string;
}

const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Read' | 'Important'>('All');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        const formatted: AppNotification[] = data.map((n: Record<string, unknown>) => ({
          id: n.id as string,
          title: (n.title as string) || 'Notification',
          message: (n.message as string) || '',
          time: new Date(n.created_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: (n.is_read as boolean) || false,
          isImportant: (n.is_important as boolean) || false,
          type: (n.type as string) || 'general',
          route: (n.route as string) || undefined,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationPress = async (notif: AppNotification) => {
    try {
      if (!notif.isRead) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notif.id);

        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      }

      if (notif.route) {
        router.push(notif.route as any);
      }
    } catch (err) {
      console.error('Error handling notification tap:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Unread') return !n.isRead;
    if (activeFilter === 'Read') return n.isRead;
    if (activeFilter === 'Important') return n.isImportant;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'academic': return { name: 'school-outline', bg: '#dbeafe', color: '#1d4ed8' };
      case 'message': return { name: 'chatbubbles-outline', bg: '#dcfce7', color: '#166534' };
      case 'fee': return { name: 'alert-circle-outline', bg: '#fee2e2', color: '#991b1b' };
      case 'attendance': return { name: 'time-outline', bg: '#fef3c7', color: '#b45309' };
      default: return { name: 'notifications-outline', bg: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return (
      <ParentLayout activeTab="Home">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading notifications...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="Home">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER & MARK ALL READ */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text }}>Notifications</Text>
          </View>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.tint }}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['All', 'Unread', 'Read', 'Important'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={{
                  paddingHorizontal: 20,
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

        {/* NOTIFICATIONS LIST */}
        {filteredNotifications.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 20 }}>
            <Ionicons name="notifications-off-outline" size={36} color={theme.icon} style={{ marginBottom: 12 }} />
            <Text style={{ color: theme.icon, textAlign: 'center', fontSize: 14 }}>No notifications found.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredNotifications.map(notif => {
              const iconInfo = getNotificationIcon(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => handleNotificationPress(notif)}
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 14
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: iconInfo.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>{notif.title}</Text>
                      {!notif.isRead && (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.tint }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 13, color: theme.icon, lineHeight: 18, marginBottom: 8 }}>{notif.message}</Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: theme.icon }}>{notif.time}</Text>
                      {notif.isImportant && (
                        <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#991b1b' }}>IMPORTANT</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>
    </ParentLayout>
  );
};

export default NotificationsScreen;
