import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../../components/ParentLayout';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../../context/StudentContext';

const SubjectDetailScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedStudent, linkedStudents } = useStudent();

  const currentStudent = selectedStudent || linkedStudents[0];
  const subjectName = (params.subject as string) || 'Subject Details';
  const score = Number(params.score) || 82;

  return (
    <ParentLayout activeTab="Academics">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '950', color: theme.text }}>Result Details</Text>
        </View>

        {/* STUDENT INFO BADGE */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold', color: theme.text }}>{currentStudent?.firstName.slice(0, 1)}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{currentStudent?.firstName} {currentStudent?.lastName}</Text>
            <Text style={{ fontSize: 12, color: theme.icon }}>{currentStudent?.className} • ID: {currentStudent?.customId}</Text>
          </View>
        </View>

        {/* SCORE BANNER */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.icon, textTransform: 'uppercase' }}>Assessment Result</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text, marginTop: 4, marginBottom: 12 }}>{subjectName}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontSize: 42, fontWeight: '950', color: theme.tint }}>{score}%</Text>
            <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: 12 }}>Good Performance</Text>
            </View>
          </View>
        </View>

        {/* SCORE BREAKDOWN */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 16 }}>Score Breakdown</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.icon, fontSize: 14 }}>Classwork</Text>
            <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 14 }}>18 / 20</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.icon, fontSize: 14 }}>Assignments</Text>
            <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 14 }}>17 / 20</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.icon, fontSize: 14 }}>Class Tests</Text>
            <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 14 }}>15 / 20</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.icon, fontSize: 14 }}>Mid-Term Examination</Text>
            <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 14 }}>32 / 40</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginTop: 4 }}>
            <Text style={{ fontWeight: '900', color: theme.text, fontSize: 15 }}>Total Score</Text>
            <Text style={{ fontWeight: '950', color: theme.tint, fontSize: 16 }}>{score} / 100</Text>
          </View>
        </View>

      </ScrollView>
    </ParentLayout>
  );
};

export default SubjectDetailScreen;
