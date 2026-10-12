import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '@/services/supabase';
import { useStudent } from '../src/context/StudentContext'; // Hook to access selected student data

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
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string>('');
  const { selectedStudent } = useStudent();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);

        // 1. Get the current authenticated user session token
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          setInsights('Please sign in to view AI-powered insights.');
          return;
        }

        // 2. Invoke Edge Function with both Auth headers and rich student context
        const response = await supabase.functions.invoke('generate-insights', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: { 
            appType, 
            moduleName,
            studentContext: selectedStudent ? {
              name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
              className: selectedStudent.className,
              academicAverage: selectedStudent.academicAverage,
              attendancePercentage: selectedStudent.attendancePercentage,
              outstandingBalance: selectedStudent.outstandingBalance
            } : null
          },
        });

        const { data, error } = response;

        if (error) {
          console.error('Full Edge Function Error Object:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        if (data?.success && data?.insights) {
          setInsights(data.insights);
        } else {
          setInsights(data?.error || 'No insights generated for this view yet.');
        }
      } catch (err: any) {
        console.error('Failed to load AI insights:', err);
        setInsights(err?.message ? `Error: ${err.message}` : 'AI intelligence layer currently offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [appType, moduleName, selectedStudent]);

  return (
    <View style={{ backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 16, padding: 16, marginVertical: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>✨ {title}</Text>
      </View>

      {loading ? (
        <View style={{ padding: 12, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#0284c7" />
          <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Gemini is analyzing system data...</Text>
        </View>
      ) : (
        <Text style={{ fontSize: 13, color: '#334155', lineHeight: 20 }}>{insights}</Text>
      )}
    </View>
  );
};
