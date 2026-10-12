import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { appType, moduleName } = await req.json();

    // Construct persona and system prompt
    const personaPrompt = `You are an expert AI support assistant for a school management system. Provide clear, helpful insights for a ${appType} regarding the ${moduleName} module.`;

    // Call local Ollama instance (or use a tunnel URL if testing from a mobile device)
    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: `${personaPrompt}\n\nProvide a short, encouraging summary insight.`,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama returned status ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    const insights = ollamaData.response || 'No insights generated.';

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
