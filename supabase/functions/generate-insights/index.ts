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
    const { appType, moduleName, studentContext } = await req.json();
    
    // 1. Retrieve the Gemini API key from Supabase cloud secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'GEMINI_API_KEY secret is missing in Supabase vault.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Construct prompt
    let personaPrompt = `You are an expert AI support assistant for the Sabio school management system. Provide clear, encouraging, and helpful insights for a ${appType} regarding the ${moduleName} module.`;
    
    if (studentContext) {
      personaPrompt += ` Target Student: ${studentContext.name}, Class: ${studentContext.className}, Average: ${studentContext.academicAverage}%, Attendance: ${studentContext.attendancePercentage}%.`;
    }

// Call Google Gemini API with the recommended model
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${personaPrompt}\n\nProvide a short, punchy summary insight (max 3 sentences).` }]
        }]
      }),
    });

    const responseText = await geminiResponse.text();

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Gemini HTTP ${geminiResponse.status}: ${responseText}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = JSON.parse(responseText);
    const insights = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated.';

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    // Return error as a 200 JSON payload so client reads the exact string instead of generic FunctionsHttpError
    return new Response(
      JSON.stringify({ success: false, error: `Edge Exception: ${error.message}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
