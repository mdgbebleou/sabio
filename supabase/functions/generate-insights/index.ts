import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { appType, moduleName, studentContext, userPrompt } = await req.json();
    
    // 1. Define prompt variables safely right at the top
    let personaPrompt = `You are an expert AI support assistant for the Sabio school management system. Provide clear, encouraging, and helpful insights for a ${appType}.`;

    if (Array.isArray(studentContext)) {
      personaPrompt += ` Comparing multiple students: ${studentContext.map((s: any) => `${s.name} (Class:${s.className}, Avg: ${s.academicAverage}\%, Attendance:${s.attendancePercentage}%)`).join(' vs ')}.`;
    } else if (studentContext) {
      personaPrompt += ` Target Student: ${studentContext.name}, Class: ${studentContext.className}, Average: ${studentContext.academicAverage}%, Attendance: ${studentContext.attendancePercentage}%, Outstanding Balance: GHS ${studentContext.outstandingBalance}.`;
    }

    const finalQuery = userPrompt || `Provide a short summary insight for module: ${moduleName}.`;
    const fullPrompt = `${personaPrompt}\n\nUser Request: ${finalQuery}\n\nGive a concise, professional response (max 3 sentences).`;

    // 2. Retrieve API keys from Supabase cloud secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    let insights = '';
    let usedProvider = 'gemini';

    // 3. Try Google Gemini API first
    if (geminiApiKey) {
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: fullPrompt }]
            }]
          }),
        });

        const responseText = await geminiResponse.text();

        if (geminiResponse.ok) {
          const geminiData = JSON.parse(responseText);
          insights = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          console.warn(`Gemini HTTP error ${geminiResponse.status}: ${responseText}. Failing over to OpenAI...`);
        }
      } catch (geminiErr) {
        console.warn('Gemini network/runtime exception, failing over to OpenAI:', geminiErr);
      }
    }

    // 4. Fallback to OpenAI if Gemini failed or key was missing
    if (!insights && openAiApiKey) {
      try {
        usedProvider = 'openai';
        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful school assistant providing brief, actionable insights.' },
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.7,
          }),
        });

        const openAiData = await openAiResponse.json();
        if (openAiResponse.ok && openAiData.choices && openAiData.choices.length > 0) {
          insights = openAiData.choices[0].message.content;
        } else {
          throw new Error(openAiData.error?.message || 'OpenAI failed to generate content');
        }
      } catch (openAiErr: any) {
        console.error('OpenAI backup fallback also failed:', openAiErr);
        return new Response(
          JSON.stringify({ success: false, error: `Both Gemini & OpenAI failed. OpenAI Error: ${openAiErr.message}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!insights) {
      return new Response(
        JSON.stringify({ success: false, error: 'Both AI providers are missing API keys or failed to return insights.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, insights, provider: usedProvider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: `Edge Exception: ${error.message}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
