import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../context/StudentContext';

interface FeeItem {
  id: string;
  name: string;
  amount: number;
  status: 'Paid' | 'Outstanding';
}

interface PaymentTransaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'Successful' | 'Pending' | 'Failed';
}

const FeesScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  // Consume global student context
  const { selectedStudent, setSelectedStudent, linkedStudents: rawLinkedStudents, loadingStudents } = useStudent();

  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [tempSelectedStudent, setTempSelectedStudent] = useState<any | null>(null);
  
  // Dynamic fee data states with empty placeholders for future backend connection
  const [loadingFees, setLoadingFees] = useState(false);
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [deadline] = useState('August 20, 2026');

  // Sync temp selector when global selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setTempSelectedStudent(selectedStudent);
    }
  }, [selectedStudent]);

  // Fetch specific fee breakdown and payment history for the selected student from backend
  useEffect(() => {
    if (!selectedStudent) return;

    let isMounted = true;
    const loadStudentFeesData = async () => {
      try {
        setLoadingFees(true);

        // 1. Fetch custom fee breakdown items for this student from Supabase
        const { data: feesData } = await supabase
          .from('student_fees')
          .select('*')
          .eq('student_id', selectedStudent.id);

        if (feesData && feesData.length > 0 && isMounted) {
          setFeeItems(feesData.map((f: any) => ({
            id: f.id,
            name: f.name,
            amount: f.amount,
            status: f.status || 'Outstanding'
          })));
        } else if (isMounted) {
          // Empty placeholder ready for backend integration
          setFeeItems([]);
        }

        // 2. Fetch payment history logs from Supabase
        const { data: payData } = await supabase
          .from('payment_history')
          .select('*')
          .eq('student_id', selectedStudent.id)
          .order('created_at', { ascending: false });

        if (payData && payData.length > 0 && isMounted) {
          setPayments(payData.map((p: any) => ({
            id: p.id,
            title: p.title || 'School Fees Payment',
            amount: p.amount,
            date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: p.status || 'Successful'
          })));
        } else if (isMounted) {
          // Empty placeholder ready for backend integration
          setPayments([]);
        }
      } catch (err) {
        console.error('Error loading fee details:', err);
      } finally {
        if (isMounted) setLoadingFees(false);
      }
    };

    loadStudentFeesData();
    return () => { isMounted = false; };
  }, [selectedStudent]);

  if (loadingStudents) {
    return (
      <ParentLayout activeTab="Fees">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading school fees...</Text>
        </View>
      </ParentLayout>
    );
  }

  const totalFees = selectedStudent ? selectedStudent.totalFees || 0 : 0;
  const paidFees = selectedStudent ? selectedStudent.paidFees || 0 : 0;
  const outstandingBalance = selectedStudent ? selectedStudent.outstandingBalance : 0;
  const percentagePaid = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  return (
    <ParentLayout activeTab="Fees">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER TITLE */}
        <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, marginBottom: 16 }}>School Fees</Text>

        {rawLinkedStudents.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: theme.icon, textAlign: 'center', fontSize: 14 }}>
              No student wards are currently linked to your account.
            </Text>
          </View>
        ) : (
          selectedStudent && (
            <View>
              {/* CHILD SELECTOR TOP BAR */}
              <TouchableOpacity
                onPress={() => {
                  setTempSelectedStudent(selectedStudent);
                  setIsChildSelectorOpen(true);
                }}
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 20,
                  padding: 14,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedStudent.avatarUrl ? (
                      <Image source={{ uri: selectedStudent.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 15 }}>
                        {selectedStudent.firstName.slice(0, 1)}{selectedStudent.lastName.slice(0, 1)}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>
                      {selectedStudent.className} • 2026 Academic Year
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={18} color={theme.icon} />
              </TouchableOpacity>

              {/* FEE OVERVIEW CARD */}
              <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.icon, marginBottom: 4 }}>OUTSTANDING BALANCE</Text>
                <Text style={{ fontSize: 32, fontWeight: '900', color: theme.text, marginBottom: 16 }}>
                  GHS {outstandingBalance.toLocaleString()}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: theme.border }}>
                  <View>
                    <Text style={{ fontSize: 11, color: theme.icon }}>Total Fees</Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text, marginTop: 2 }}>GHS {totalFees.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, color: theme.icon }}>Amount Paid</Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#166534', marginTop: 2 }}>GHS {paidFees.toLocaleString()}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{percentagePaid}% of fees paid</Text>
                  <Text style={{ fontSize: 12, color: theme.icon }}>Next deadline: {deadline}</Text>
                </View>

                {/* PROGRESS BAR */}
                <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${percentagePaid}%`, backgroundColor: theme.tint, borderRadius: 4 }} />
                </View>
              </View>

              {/* PAYMENT REMINDER BANNER */}
              {outstandingBalance > 0 && (
                <View style={{ backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 20, padding: 16, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                    <Ionicons name="alert-circle" size={22} color="#c2410c" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#9a3412', lineHeight: 18 }}>
                        Payment Reminder: GHS {outstandingBalance.toLocaleString()} remains outstanding. Payment due by {deadline}.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* MAKE PAYMENT ACTION BUTTON */}
              <TouchableOpacity 
                onPress={() => router.push('/fees/payment' as any)}
                style={{ backgroundColor: '#1e3a8a', paddingVertical: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
              >
                <MaterialCommunityIcons name="wallet-outline" size={20} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Make Payment</Text>
              </TouchableOpacity>

              {/* FEE BREAKDOWN SECTION */}
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Fee Breakdown</Text>
              
              <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 16, marginBottom: 24 }}>
                {loadingFees ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={theme.tint} />
                  </View>
                ) : feeItems.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: theme.icon, fontSize: 13, fontStyle: 'italic' }}>No fee breakdown items recorded yet.</Text>
                  </View>
                ) : (
                  feeItems.map((item, index) => {
                    const isPaid = item.status === 'Paid';
                    return (
                      <View 
                        key={item.id} 
                        style={{ 
                          flexDirection: 'row', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          paddingVertical: 14, 
                          borderBottomWidth: index < feeItems.length - 1 ? 1 : 0, 
                          borderColor: theme.border 
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isPaid ? '#dcfce7' : '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={isPaid ? "checkmark" : "time-outline"} size={14} color={isPaid ? "#166534" : "#b45309"} />
                          </View>
                          <View>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{item.name}</Text>
                            <Text style={{ fontSize: 11, color: isPaid ? '#166534' : '#b45309', fontWeight: '600', marginTop: 2 }}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>GHS {item.amount.toLocaleString()}</Text>
                      </View>
                    );
                  })
                )}
              </View>

              {/* PAYMENT HISTORY SECTION */}
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Payment History</Text>
              
              <View style={{ gap: 12, marginBottom: 20 }}>
                {payments.length === 0 ? (
                  <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: theme.icon, fontSize: 13, fontStyle: 'italic' }}>No payment transactions recorded yet.</Text>
                  </View>
                ) : (
                  payments.map((p) => (
                    <View 
                      key={p.id}
                      style={{ 
                        backgroundColor: theme.card, 
                        borderWidth: 1, 
                        borderColor: theme.border, 
                        borderRadius: 20, 
                        padding: 16, 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>{p.title}</Text>
                        <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{p.date}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#166534" />
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>{p.status}</Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e3a8a' }}>GHS {p.amount.toLocaleString()}</Text>
                        <TouchableOpacity onPress={() => router.push(`/fees/receipt?id=${p.id}` as any)} style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.tint }}>View Receipt</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <TouchableOpacity 
                onPress={() => router.push('/fees/all' as any)}
                style={{ alignItems: 'center', paddingVertical: 12, marginBottom: 20 }}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.tint }}>View All Payments →</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {/* SELECT CHILD MODAL */}
        <Modal
          visible={isChildSelectorOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsChildSelectorOpen(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '80%' }}>
              
              <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, marginBottom: 20 }} />

              <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text, marginBottom: 6 }}>Select Child</Text>
              <Text style={{ fontSize: 13, color: theme.icon, marginBottom: 20 }}>Choose a child to view their school fees.</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ gap: 12 }}>
                  {rawLinkedStudents.map((child: any) => {
                    const isSelected = tempSelectedStudent?.id === child.id;
                    return (
                      <TouchableOpacity
                        key={child.id}
                        onPress={() => setTempSelectedStudent(child)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          borderRadius: 20,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? theme.tint : theme.border,
                          backgroundColor: theme.card
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                            {child.avatarUrl ? (
                              <Image source={{ uri: child.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 16 }}>
                                {child.firstName.slice(0, 1)}{child.lastName.slice(0, 1)}
                              </Text>
                            )}
                          </View>
                          <View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                              {child.firstName} {child.lastName}
                            </Text>
                            <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{child.className} • ID: {child.customId}</Text>
                          </View>
                        </View>

                        <View style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: isSelected ? 0 : 2,
                          borderColor: theme.border,
                          backgroundColor: isSelected ? theme.tint : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSelected && <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => {
                  if (tempSelectedStudent) {
                    setSelectedStudent(tempSelectedStudent);
                  }
                  setIsChildSelectorOpen(false);
                }}
                style={{
                  backgroundColor: theme.tint,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>Continue</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </ScrollView>
    </ParentLayout>
  );
};

export default FeesScreen;
