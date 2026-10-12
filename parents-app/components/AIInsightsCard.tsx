import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '@/services/supabase';
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

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        // Call your live Supabase Edge Function securely
        const { data, error } = await supabase.functions.invoke('generate-insights', {
          body: { appType, moduleName },
        });

        if (error) throw error;
        if (data?.success) {
          setInsights(data.insights);
        } else {
          setInsights('Unable to generate insights at this moment.');
        }
      } catch (err) {
        console.error('Failed to load AI insights:', err);
        setInsights('AI intelligence layer currently offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [appType, moduleName]);

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
