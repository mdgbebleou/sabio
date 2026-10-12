import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'Examination' | 'Meeting' | 'Deadline' | 'School Event';
  date: string;
  rawDate: string;
  time: string;
  location: string;
  audience: string;
  description: string;
  childName?: string;
  childClass?: string;
  instructions?: string[];
  documents?: { name: string; size: string }[];
}

export default function ParentCalendar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calendar' | 'details'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchParentEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted: CalendarEvent[] = data.map((item: Record<string, unknown>) => {
          const dbType = String(item.event_type || '');
          let mappedType: 'Examination' | 'Meeting' | 'Deadline' | 'School Event' = 'School Event';
          if (dbType === 'Exam' || dbType === 'Examination') mappedType = 'Examination';
          else if (dbType === 'Meeting') mappedType = 'Meeting';
          else if (dbType === 'Deadline') mappedType = 'Deadline';

          const eventDateStr = String(item.event_date || '');
          const dateObj = new Date(eventDateStr + 'T00:00:00');
          const uiDate = isNaN(dateObj.getTime()) 
            ? eventDateStr 
            : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          const startTime = item.start_time ? String(item.start_time) : '';
          const endTime = item.end_time ? String(item.end_time) : '';
          const timeStr = startTime ? `${startTime}${endTime ? ' - ' + endTime : ''}` : 'All Day';

          return {
            id: String(item.id || ''),
            title: String(item.title || ''),
            type: mappedType,
            date: uiDate,
            rawDate: eventDateStr,
            time: timeStr,
            location: item.location ? String(item.location) : 'Bright Future Academy',
            audience: item.is_school_wide ? 'All Students' : 'JHS 1-3 Students',
            description: item.description ? String(item.description) : 'No description provided.',
            childName: 'Daniel Mensah',
            childClass: 'JHS 2',
            instructions: [
              'Arrive by 7:45 AM daily.',
              'Bring required materials (pens, pencils, mathematical set).',
              'Complete any outstanding school fee requirements prior to the first exam day.'
            ],
            documents: [
              { name: 'Mid-Term Guidelines.pdf', size: '245 KB' }
            ]
          };
        });

        setEvents(formatted);
      }
    } catch (err) {
      console.error('Error fetching parent calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotificationsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadNotificationsCount(count);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  useEffect(() => {
    fetchParentEvents();
    fetchNotificationsCount();
  }, [fetchParentEvents]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const daysArray = [];

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const rawDate = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      daysArray.push({ dayNum, isCurrentMonth: false, rawDate });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const rawDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      daysArray.push({ dayNum: i, isCurrentMonth: true, rawDate });
    }

    const remainingSlots = 7 - (daysArray.length % 7);
    if (remainingSlots < 7) {
      for (let i = 1; i <= remainingSlots; i++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const rawDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        daysArray.push({ dayNum: i, isCurrentMonth: false, rawDate });
      }
    }

    return daysArray;
  }, [currentDate]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <View style={styles.container}>
      {activeTab === 'calendar' && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>School Calendar</Text>
              <Text style={styles.headerSubtitle}>2026 Academic Year Term 1</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            <View style={styles.calendarCard}>
              <View style={styles.calendarNav}>
                <TouchableOpacity onPress={handlePrevMonth}>
                  <Text style={styles.navArrow}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={handleNextMonth}>
                  <Text style={styles.navArrow}>Next</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekHeaderGrid}>
                <Text style={styles.weekHeaderDay}>Mon</Text>
                <Text style={styles.weekHeaderDay}>Tue</Text>
                <Text style={styles.weekHeaderDay}>Wed</Text>
                <Text style={styles.weekHeaderDay}>Thu</Text>
                <Text style={styles.weekHeaderDay}>Fri</Text>
                <Text style={styles.weekHeaderDay}>Sat</Text>
                <Text style={styles.weekHeaderDay}>Sun</Text>
              </View>

              <View style={styles.daysGrid}>
                {monthGrid.map((slot, index) => {
                  const hasEvent = events.some(e => e.rawDate === slot.rawDate);
                  const isSelectedDate = slot.dayNum === 7 && slot.isCurrentMonth;

                  return (
                    <View key={index} style={styles.dayCell}>
                      <View style={[styles.dayCircle, isSelectedDate && styles.selectedDayCircle]}>
                        <Text style={[
                          styles.dayText,
                          isSelectedDate ? styles.selectedDayText : slot.isCurrentMonth ? styles.currentMonthText : styles.otherMonthText
                        ]}>
                          {slot.dayNum}
                        </Text>
                      </View>
                      {hasEvent && slot.isCurrentMonth && <View style={styles.eventDot} />}
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Upcoming Events</Text>

            {loading ? (
              <ActivityIndicator size="small" color="#1e3a8a" style={{ marginVertical: 20 }} />
            ) : events.length === 0 ? (
              <Text style={styles.centerText}>No events scheduled.</Text>
            ) : (
              events.map(ev => (
                <TouchableOpacity 
                  key={ev.id} 
                  onPress={() => { setSelectedEvent(ev); setActiveTab('details'); }}
                  style={styles.eventCard}
                >
                  <View style={styles.eventCardIconBox}>
                    <Text style={styles.eventCardIconText}>{ev.type[0]}</Text>
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitleText} numberOfLines={1}>{ev.title}</Text>
                    <Text style={styles.eventSubText}>{ev.date} {ev.time !== 'All Day' ? `• ${ev.time}` : ''}</Text>
                    <View style={styles.tagRow}>
                      <View style={styles.tag}><Text style={styles.tagText}>{ev.audience}</Text></View>
                      <View style={styles.tag}><Text style={styles.tagText}>{ev.type}</Text></View>
                    </View>
                  </View>

                  <Text style={styles.chevron}>&gt;</Text>
                </TouchableOpacity>
              ))
            )}

            <View style={styles.filterButtonContainer}>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Filter Events</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        
        </>
      )}

      {activeTab === 'details' && selectedEvent && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setActiveTab('calendar')} style={styles.iconButton}>
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Event Details</Text>
            <TouchableOpacity onPress={() => alert('Calendar synced!')} style={styles.iconButton}>
              <Text style={styles.syncText}>Sync</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{selectedEvent.type}</Text>
            </View>
            <Text style={styles.detailMainTitle}>{selectedEvent.title}</Text>

            <View style={styles.detailsInfoCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailIconLabel}>Date</Text>
                <View>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{selectedEvent.date}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailIconLabel}>Time</Text>
                <View>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{selectedEvent.time}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailIconLabel}>Loc</Text>
                <View>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedEvent.location}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailIconLabel}>Aud</Text>
                <View>
                  <Text style={styles.detailLabel}>Audience</Text>
                  <Text style={styles.detailValue}>{selectedEvent.audience}</Text>
                </View>
              </View>
            </View>

            <View style={styles.childCard}>
              <Text style={styles.childCardHeader}>FOR YOUR CHILD</Text>
              <View style={styles.childRow}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>DM</Text>
                </View>
                <View>
                  <Text style={styles.childName}>{selectedEvent.childName}</Text>
                  <Text style={styles.childClass}>{selectedEvent.childClass}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeader}>About This Event</Text>
            <Text style={styles.descriptionText}>{selectedEvent.description}</Text>

            <Text style={styles.sectionHeader}>Important Information</Text>
            <View style={styles.instructionsContainer}>
              {selectedEvent.instructions?.map((inst, i) => (
                <View key={i} style={styles.instructionRow}>
                  <Text style={styles.checkText}>[x]</Text>
                  <Text style={styles.instructionText}>{inst}</Text>
                </View>
              ))}
            </View>

            {selectedEvent.documents && selectedEvent.documents.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Related Documents</Text>
                <View style={styles.docCard}>
                  <View style={styles.docLeft}>
                    <View style={styles.pdfBox}><Text style={styles.pdfText}>PDF</Text></View>
                    <View>
                      <Text style={styles.docName}>{selectedEvent.documents[0].name}</Text>
                      <Text style={styles.docSize}>{selectedEvent.documents[0].size}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => alert('Downloading document...')}>
                    <Text style={styles.downloadText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity 
              onPress={() => alert('Reminder successfully added for this event!')} 
              style={styles.reminderButton}
            >
              <Text style={styles.reminderButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    width: '100%',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    padding: 4,
  },
  backArrowText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  syncText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#002b49',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  bellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc2626',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    padding: 4,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  weekHeaderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekHeaderDay: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCircle: {
    backgroundColor: '#1e3a8a',
  },
  dayText: {
    fontSize: 12,
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  currentMonthText: {
    color: '#0f172a',
  },
  otherMonthText: {
    color: '#cbd5e1',
  },
  eventDot: {
    width: 4,
    height: 4,
    backgroundColor: '#0284c7',
    borderRadius: 2,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  centerText: {
    textAlign: 'center',
    color: '#64748b',
    padding: 20,
    fontSize: 12,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventCardIconText: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  eventSubText: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
  },
  chevron: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  navItem: {
    fontSize: 10,
    color: '#64748b',
  },
  activeNavItem: {
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  typeBadge: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3730a3',
  },
  detailMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
  },
  detailsInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconLabel: {
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#334155',
    fontSize: 11,
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  childCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  childCardHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 8,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002b49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  childName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  childClass: {
    fontSize: 11,
    color: '#64748b',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  instructionsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  docCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pdfBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  docName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  docSize: {
    fontSize: 10,
    color: '#64748b',
  },
  downloadText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reminderButton: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
