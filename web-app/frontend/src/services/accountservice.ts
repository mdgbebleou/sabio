import { supabase } from './supabase';

export interface PaymentTransaction {
  id: string;
  feeId: string;
  studentId: string;
  amount: number;
  method: string;
  reference?: string | null;
  notes?: string | null;
  status: string;
  paidAt: string;
}

/**
 * Record a new payment transaction and automatically update the student's fee balance.
 */
export async function recordPaymentTransaction(data: {
  feeId: string;
  studentId: string;
  amount: number;
  method: string;
  reference?: string | null;
  notes?: string | null;
}) {
  // 1. Insert into the payments table
  const { error: payErr } = await supabase.from('payments').insert([
    {
      fee_id: data.feeId,
      student_id: data.studentId,
      amount: data.amount,
      method: data.method,
      reference: data.reference || null,
      notes: data.notes || null,
      status: 'Completed',
    },
  ]);
  if (payErr) throw payErr;

  // 2. Fetch current fee totals to compute new balance
  const { data: feeRecord, error: fetchErr } = await supabase
    .from('fees')
    .select('total_fees, amount_paid')
    .eq('id', data.feeId)
    .single();

  if (fetchErr) throw fetchErr;

  const newAmountPaid = Number(feeRecord.amount_paid || 0) + data.amount;
  const totalFees = Number(feeRecord.total_fees || 0);
  const newBalance = Math.max(0, totalFees - newAmountPaid);
  
  let newStatus = 'Outstanding';
  if (newBalance === 0) {
    newStatus = 'Paid';
  } else if (newAmountPaid > 0) {
    newStatus = 'Partially Paid';
  }

  // 3. Update the fee ledger record
  const { error: updateErr } = await supabase
    .from('fees')
    .update({
      amount_paid: newAmountPaid,
      balance: newBalance,
      status: newStatus,
    })
    .eq('id', data.feeId);

  if (updateErr) throw updateErr;
}

/**
 * Fetch all recorded payment transactions across the school for the payment history page.
 */
export async function getAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      method,
      reference,
      notes,
      status,
      paid_at,
      students (
        first_name,
        last_name,
        custom_id,
        class_name
      )
    `)
    .order('paid_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    reference: p.reference,
    notes: p.notes,
    status: p.status,
    paidAt: p.paid_at,
    studentName: p.students ? `${p.students.first_name} ${p.students.last_name}` : 'Unknown Student',
    studentCustomId: p.students?.custom_id || '-',
    className: p.students?.class_name || '-',
  }));
}

/**
 * Fetch payment history for a specific fee ID.
 */
export async function getPaymentsForFee(feeId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('fee_id', feeId)
    .order('paid_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    reference: p.reference,
    notes: p.notes,
    status: p.status,
    paidAt: p.paid_at,
  }));
}
