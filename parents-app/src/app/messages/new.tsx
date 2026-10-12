import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../../components/ParentLayout'; // Adjust relative path if needed based on your folder depth
import { supabase } from '../../services/supabase';
import { useTheme } from '@/hooks/use-theme';

interface LinkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  customId: string;
  avatarUrl?: string;
}

interface TeacherOption {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

const NewMessageScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null);

  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Modals for selection pickers
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // 1. Fetch parent's children
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', session.user.id);

        if (studentsData && studentsData.length > 0 && isMounted) {
          const formattedStudents: LinkedStudent[] = studentsData.map((st: Record<string, unknown>) => ({
            id: st.id as string,
            firstName: (st.first_name as string) || '',
            lastName: (st.last_name as string) || '',
            className: (st.class_name as string) || 'Unassigned',
            customId: (st.custom_id as string) || '',
            avatarUrl: (st.avatar_url as string) || undefined,
          }));

          setLinkedStudents(formattedStudents);
          setSelectedStudent(formattedStudents[0]);
        }

        // 2. Fetch available teachers (profiles with teacher/staff role or simply all profiles)
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, role')
          .neq('id', session.user.id);

        if (teacherData && isMounted) {
          const formattedTeachers: TeacherOption[] = teacherData.map((t: Record<string, unknown>) => ({
            id: t.id as string,
            name: `Mr./Ms. ${t.first_name || ''} ${t.last_name || ''}`.trim(),
            role: (t.role as string) || 'Class Teacher',
            avatarUrl: (t.avatar_url as string) || undefined,
          }));

          setTeachers(formattedTeachers);
          if (formattedTeachers.length > 0) {
            setSelectedTeacher(formattedTeachers[0]);
          }
        }
      } catch (err) {
        console.error('Error loading new message data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSendMessage = async () => {
    if (!selectedStudent || !selectedTeacher) {
      Alert.alert('Missing Information', 'Please select a child and a teacher.');
      return;
    }
    if (!subject.trim() || !messageContent.trim()) {
      Alert.alert('Missing Fields', 'Please enter both a subject and a message.');
      return;
    }

    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // 1. Check if a thread already exists between this parent, teacher, and student
      let threadId: string;
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('id')
        .eq('parent_id', session.user.id)
        .eq('teacher_id', selectedTeacher.id)
        .eq('student_id', selectedStudent.id)
        .maybeSingle();

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        // Create new thread
        const { data: newThread, error: threadErr } = await supabase
          .from('message_threads')
          .insert({
            parent_id: session.user.id,
            teacher_id: selectedTeacher.id,
            student_id: selectedStudent.id,
            subject: subject.trim(),
          })
          .select('id')
          .single();

        if (threadErr || !newThread) throw threadErr;
        threadId = newThread.id;
      }

      // 2. Insert the message into messages table
      const { error: msgErr } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: session.user.id,
          content: messageContent.trim(),
          is_read: false,
        });

      if (msgErr) throw msgErr;

      Alert.alert('Success', 'Message sent successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error sending message:', err);
      Alert.alert('Error', `Failed to send message: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ParentLayout activeTab="Messages">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading composition form...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="Messages">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text }}>New Message</Text>
        </View>

        {/* REGARDING CHILD SELECTOR */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.icon, marginBottom: 6 }}>Regarding Child</Text>
          <TouchableOpacity
            onPress={() => setIsStudentModalOpen(true)}
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                {selectedStudent?.avatarUrl ? (
                  <Image source={{ uri: selectedStudent.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 14 }}>
                    {selectedStudent?.firstName?.[0] || 'S'}
                  </Text>
                )}
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                  {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Select a child'}
                </Text>
                <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{selectedStudent?.className}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* TO (TEACHER) SELECTOR */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.icon, marginBottom: 6 }}>To</Text>
          <TouchableOpacity
            onPress={() => setIsTeacherModalOpen(true)}
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="school" size={20} color="#1d4ed8" />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                  {selectedTeacher ? selectedTeacher.name : 'Select a teacher'}
                </Text>
                <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{selectedTeacher?.role || 'Teacher'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* SUBJECT INPUT */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.icon, marginBottom: 6 }}>Subject</Text>
          <TextInput
            placeholder="e.g., Mathematics Progress"
            placeholderTextColor={theme.icon}
            value={subject}
            onChangeText={setSubject}
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 16,
              padding: 14,
              fontSize: 14,
              color: theme.text
            }}
          />
        </View>

        {/* MESSAGE INPUT */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.icon, marginBottom: 6 }}>Message</Text>
          <TextInput
            placeholder="Write your message here..."
            placeholderTextColor={theme.icon}
            value={messageContent}
            onChangeText={setMessageContent}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 16,
              padding: 14,
              fontSize: 14,
              color: theme.text,
              minHeight: 120
            }}
          />
        </View>

        {/* GUIDELINE BOX */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Ionicons name="information-circle-outline" size={20} color={theme.icon} />
          <Text style={{ fontSize: 12, color: theme.icon, flex: 1, lineHeight: 16 }}>
            Please keep messages related to your child's education and school activities.
          </Text>
        </View>

        {/* SEND BUTTON */}
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={submitting}
          style={{
            backgroundColor: theme.tint,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 40
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>

        {/* STUDENT SELECTOR MODAL */}
        <Modal visible={isStudentModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsStudentModalOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '60%' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text, marginBottom: 16 }}>Select Child</Text>
              <ScrollView>
                {linkedStudents.map(child => (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => {
                      setSelectedStudent(child);
                      setIsStudentModalOpen(false);
                    }}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{child.firstName} {child.lastName} ({child.className})</Text>
                    {selectedStudent?.id === child.id && <Ionicons name="checkmark" size={18} color={theme.tint} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* TEACHER SELECTOR MODAL */}
        <Modal visible={isTeacherModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsTeacherModalOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '60%' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text, marginBottom: 16 }}>Select Teacher</Text>
              <ScrollView>
                {teachers.map(teacher => (
                  <TouchableOpacity
                    key={teacher.id}
                    onPress={() => {
                      setSelectedTeacher(teacher);
                      setIsTeacherModalOpen(false);
                    }}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{teacher.name}</Text>
                      <Text style={{ fontSize: 11, color: theme.icon }}>{teacher.role}</Text>
                    </View>
                    {selectedTeacher?.id === teacher.id && <Ionicons name="checkmark" size={18} color={theme.tint} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </ParentLayout>
  );
};

export default NewMessageScreen;
