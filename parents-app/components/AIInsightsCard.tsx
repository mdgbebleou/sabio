import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useStudent } from '../src/context/StudentContext';

// Global memory cache to persist insights across component remounts & app navigation (0 API waste on restart)
const insightsCache: { [studentId: string]: string } = {};

interface AIInsightsCardProps {
  appType: 'parent' | 'admin' | 'teacher' | 'finance';
  moduleName: string;
  title?: string;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ 
  appType, 
  moduleName, 
  title = 'Intelligent AI Insights' 
}) => {
  const { selectedStudent } = useStudent();
  const studentId = selectedStudent?.id || 'general';

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>(() => {
    // Check if we already have a cached insight for this student in memory
    return insightsCache[studentId] || '';
  });

  const fetchInsights = async (forceRefresh = false) => {
    // If we already have a cached insight for this student and aren't forcing a refresh, do nothing (0 API calls!)
    if (!forceRefresh && insightsCache[studentId]) {
      setInsights(insightsCache[studentId]);
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        setInsights('Please sign in to view AI-powered insights.');
        return;
      }

      const studentPayload = selectedStudent ? {
        name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        className: selectedStudent.className,
        academicAverage: selectedStudent.academicAverage,
        attendancePercentage: selectedStudent.attendancePercentage,
        outstandingBalance: selectedStudent.outstandingBalance
      } : null;

      const response = await supabase.functions.invoke('generate-insights', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { 
          appType, 
          moduleName,
          studentContext: studentPayload
        },
      });

      const { data, error } = response;
      if (error) throw error;

      if (data?.success && data?.insights) {
        setInsights(data.insights);
        // Save to memory cache
        insightsCache[studentId] = data.insights;
      } else {
        setInsights(data?.error || 'No insights generated for this view yet.');
      }
    } catch (err: any) {
      console.error('Failed to load AI insights:', err);
      setInsights('AI intelligence layer currently offline.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger only when student changes or if cache is completely empty
  useEffect(() => {
    if (insightsCache[studentId]) {
      setInsights(insightsCache[studentId]);
    } else {
      // First time loading this specific child, fetch once
      void fetchInsights(false);
    }
  }, [studentId]);

  return (
    <View style={{ backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 16, padding: 16, marginVertical: 12 }}>
      
      {/* HEADER WITH TITLE & MANUAL REFRESH BUTTON */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>✨ {title}</Text>
        
        <TouchableOpacity 
          onPress={() => fetchInsights(true)}
          disabled={loading}
          style={{ padding: 4 }}
        >
          <Ionicons name="reload-outline" size={16} color="#0284c7" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: 12, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#0284c7" />
          <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Analyzing system data...</Text>
        </View>
      ) : (
        <Text style={{ fontSize: 13, color: '#334155', lineHeight: 20 }}>
          {insights || 'Tap the refresh icon to load AI insights for this ward.'}
        </Text>
      )}
    </View>
  );
};
