// services/ollamaClient.ts
import { Ollama } from 'ollama';
import { supabase } from './supabase';

// Connect to your local Ollama instance
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export async function askLocalAI(
  pageContext: 'finance' | 'academics' | 'parent_dashboard' | 'general', 
  userQuery: string, 
  studentId?: string
) {
  let liveDataPayload = {};

  try {
    // 1. Dynamic Context Injection (RAG): Pull data from Supabase based on context
    if (pageContext === 'finance' && studentId) {
      const { data: fees } = await supabase
        .from('fees')
        .select('category, total_fees, amount_paid, balance, status, due_date, term')
        .eq('student_id', studentId);
      
      const { data: payments } = await supabase
        .from('fee_payments')
        .select('amount, payment_method, created_at')
        .eq('student_id', studentId);

      liveDataPayload = { studentFees: fees, paymentHistory: payments };
    } 
    else if (pageContext === 'academics' && studentId) {
      const { data: scores } = await supabase
        .from('scores')
        .select('total_score, assessments(subject, term)')
        .eq('student_id', studentId);

      liveDataPayload = { studentScores: scores };
    }

    // 2. Define a clean, non-restrictive system role that prioritizes factual data accuracy
    const systemPrompt = `
      You are an expert AI assistant embedded inside a school management system. 
      Your task is to answer user questions truthfully and accurately using ONLY the provided Live Database JSON context. 
      Do not invent facts or numbers. If the data to answer the question is missing from the payload, kindly state that the information is currently unavailable in the records.
    `;

    // 3. Assemble the prompt package
    const fullPromptText = `
      [System Instructions]: ${systemPrompt}
      [Active Module]: ${pageContext}
      [Database Records JSON]: ${JSON.stringify(liveDataPayload)}
      [User Question]: ${userQuery}
    `;

    // 4. Call local Ollama model (e.g., llama3.1 or qwen2.5-coder for developer tasks)
    const response = await ollama.chat({
      model: 'llama3.1', // Ensure you ran `ollama pull llama3.1` in your terminal
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the current system data: ${JSON.stringify(liveDataPayload)}. \n\n User Question: ${userQuery}` }
      ],
      stream: false,
    });

    return response.message.content;

  } catch (err: any) {
    console.error('Ollama Local AI Error:', err);
    if (err.code === 'ECONNREFUSED' || err.message?.includes('Network request failed')) {
      return 'Local AI server is offline. Please ensure Ollama is running on your machine.';
    }
    return 'An error occurred while processing your request locally.';
  }
}
