import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudent } from '../src/context/StudentContext';

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
  const { selectedStudent, loadingStudents } = useStudent();
  const studentId = selectedStudent?.id || 'general';

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>(() => {
    return insightsCache[studentId] || '';
  });

  const fetchInsights = async (forceRefresh = false) => {
    if (loadingStudents) return;

    if (!forceRefresh && insightsCache[studentId]) {
      setInsights(insightsCache[studentId]);
      return;
    }

    // Expand timeout to 180 seconds (3 minutes) for local model stability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
      setLoading(true);

      const systemPrompt = `
        You are an expert school advisor speaking directly to a parent on a school app dashboard. 
        Provide a concise, warm, professional 1-2 sentence recommendation or tip encouraging them to check their child's progress, attendance, and fee status.
        CRITICAL RULES: Do not list names, classes, scores, percentages, or financial balances. Do not use bullet points or introductory data lines. Start your response directly with the advice.
      `;

      const response = await fetch('http://172.20.10.2:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3',
          prompt: systemPrompt,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      let botReplyText = result?.response ? result.response.trim() : '';

      const finalInsight = botReplyText && botReplyText.length > 10 && !botReplyText.toLowerCase().includes('student name:')
        ? botReplyText 
        : `Support your child's educational journey today by reviewing their latest attendance and staying connected with school updates.`;

      setInsights(finalInsight);
      insightsCache[studentId] = finalInsight;

    } catch (err: any) {
      clearTimeout(timeoutId);
      // Suppress annoying RedBox warning stack traces for expected aborts
      let errorMsg = 'Local AI intelligence layer currently offline.';
      if (err.name === 'AbortError') {
        errorMsg = 'Model is warming up. Tap reload to try again.';
      } else {
        console.error('Failed to load local AI insights:', err);
      }
      setInsights(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingStudents && studentId) {
      if (insightsCache[studentId]) {
        setInsights(insightsCache[studentId]);
      } else {
        void fetchInsights(false);
      }
    }
  }, [studentId, loadingStudents]);

  return (
    <View style={{ backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 16, padding: 16, marginVertical: 12 }}>
      
      {/* HEADER WITH TITLE & MANUAL REFRESH BUTTON */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>✨ {title}</Text>
        
        <TouchableOpacity 
          onPress={() => fetchInsights(true)}
          disabled={loading || loadingStudents}
          style={{ padding: 4 }}
        >
          <Ionicons name="reload-outline" size={16} color="#0284c7" />
        </TouchableOpacity>
      </View>

      {loading || loadingStudents ? (
        <View style={{ padding: 12, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#0284c7" />
          <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Analyzing records...</Text>
        </View>
      ) : (
        <Text style={{ fontSize: 13, color: '#334155', lineHeight: 20 }}>
          {insights || 'Tap the refresh icon to load AI insights for this ward.'}
        </Text>
      )}
    </View>
  );
};
