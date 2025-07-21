import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator, Button, Modal, TouchableOpacity, TextInput, Switch, Platform, Alert, ScrollView } from 'react-native';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const ATTENDANCE_CACHE_KEY = 'attendance_cache';
const ATTENDANCE_QUEUE_KEY = 'attendance_queue';

export default function AttendanceScreen() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ member_id: '', event_id: '', date: '', present: true, notes: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [massModalVisible, setMassModalVisible] = useState(false);
  const [massEventId, setMassEventId] = useState('');
  const [massDate, setMassDate] = useState('');
  const [massAttendance, setMassAttendance] = useState({});
  const [massSubmitting, setMassSubmitting] = useState(false);
  const [massError, setMassError] = useState('');
  const [massSuccess, setMassSuccess] = useState(false);
  const [massShowDatePicker, setMassShowDatePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ member_id: '', event_id: '', date: '', present: true, notes: '' });
  const [editShowDatePicker, setEditShowDatePicker] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();

  // Network status effect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Sync offline queue when back online
  useEffect(() => {
    if (isConnected) {
      syncOfflineQueue();
    }
  }, [isConnected]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      }
    });
  }, []);

  // Fetch attendance (from cache if offline)
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    if (isConnected) {
      const { data, error } = await supabase
        .from('attendance')
        .select('id, attendance_date, present, notes, members (first_name, last_name), event_id, events (title)')
        .order('attendance_date', { ascending: false });
      if (!error) {
        setAttendance(data || []);
        await AsyncStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(data || []));
      } else {
        // fallback to cache
        const cached = await AsyncStorage.getItem(ATTENDANCE_CACHE_KEY);
        setAttendance(cached ? JSON.parse(cached) : []);
      }
    } else {
      const cached = await AsyncStorage.getItem(ATTENDANCE_CACHE_KEY);
      setAttendance(cached ? JSON.parse(cached) : []);
    }
    setLoading(false);
  }, [isConnected]);

  const fetchMembersAndEvents = useCallback(async () => {
    const { data: membersData } = await supabase.from('members').select('id, first_name, last_name');
    const { data: eventsData } = await supabase.from('events').select('id, title');
    setMembers(membersData || []);
    setEvents(eventsData || []);
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchMembersAndEvents();
  }, [fetchAttendance, fetchMembersAndEvents]);

  const getMemberName = (record) => {
    if (record.members) {
      return `${record.members.first_name} ${record.members.last_name}`;
    }
    return 'Unknown Member';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleOpenModal = () => {
    setForm({ member_id: '', event_id: '', date: '', present: true, notes: '' });
    setMemberSearch('');
    setEventSearch('');
    setError('');
    setSuccess(false);
    setModalVisible(true);
  };

  // Queue attendance record if offline
  const queueAttendance = async (record) => {
    const queue = await AsyncStorage.getItem(ATTENDANCE_QUEUE_KEY);
    const arr = queue ? JSON.parse(queue) : [];
    arr.push(record);
    await AsyncStorage.setItem(ATTENDANCE_QUEUE_KEY, JSON.stringify(arr));
  };

  // Sync offline queue to Supabase
  const syncOfflineQueue = async () => {
    const queue = await AsyncStorage.getItem(ATTENDANCE_QUEUE_KEY);
    if (queue) {
      const arr = JSON.parse(queue);
      if (arr.length > 0) {
        for (const rec of arr) {
          await supabase.from('attendance').insert(rec);
        }
        await AsyncStorage.removeItem(ATTENDANCE_QUEUE_KEY);
        fetchAttendance();
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);
    if (!form.member_id || !form.event_id || !form.date) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      if (isConnected) {
        const { error: insertError } = await supabase.from('attendance').insert({
          member_id: form.member_id,
          event_id: form.event_id,
          attendance_date: form.date,
          present: form.present,
          notes: form.notes,
        });
        if (insertError) {
          setError(insertError.message || 'Failed to record attendance.');
        } else {
          setSuccess(true);
          setModalVisible(false);
          fetchAttendance();
          setTimeout(() => setSuccess(false), 2000);
        }
      } else {
        await queueAttendance({
          member_id: form.member_id,
          event_id: form.event_id,
          attendance_date: form.date,
          present: form.present,
          notes: form.notes,
        });
        setSuccess(true);
        setModalVisible(false);
        fetchAttendance();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e) {
      setError('Failed to record attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open mass modal and initialize state
  const handleOpenMassModal = () => {
    setMassEventId('');
    setMassDate('');
    setMassAttendance(members.reduce((acc, m) => {
      acc[m.id] = { present: true, notes: '' };
      return acc;
    }, {}));
    setMassError('');
    setMassSuccess(false);
    setMassModalVisible(true);
  };

  // Handle toggle present/absent for a member
  const handleMassTogglePresent = (memberId) => {
    setMassAttendance(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        present: !prev[memberId].present,
      },
    }));
  };

  // Handle notes change for a member
  const handleMassNoteChange = (memberId, value) => {
    setMassAttendance(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        notes: value,
      },
    }));
  };

  // Submit mass attendance
  const handleMassSubmit = async () => {
    setMassError('');
    setMassSuccess(false);
    if (!massEventId || !massDate) {
      setMassError('Please select event and date.');
      return;
    }
    setMassSubmitting(true);
    try {
      const records = members.map(m => ({
        member_id: m.id,
        event_id: massEventId,
        attendance_date: massDate,
        present: massAttendance[m.id]?.present ?? true,
        notes: massAttendance[m.id]?.notes || '',
      }));
      if (isConnected) {
        const { error: insertError } = await supabase.from('attendance').upsert(records, { onConflict: 'member_id,event_id,attendance_date' });
        if (insertError) {
          setMassError(insertError.message || 'Failed to record mass attendance.');
        } else {
          setMassSuccess(true);
          setMassModalVisible(false);
          fetchAttendance();
          setTimeout(() => setMassSuccess(false), 2000);
        }
      } else {
        // queue all records
        for (const rec of records) {
          await queueAttendance(rec);
        }
        setMassSuccess(true);
        setMassModalVisible(false);
        fetchAttendance();
        setTimeout(() => setMassSuccess(false), 2000);
      }
    } catch (e) {
      setMassError('Failed to record mass attendance.');
    } finally {
      setMassSubmitting(false);
    }
  };

  // Open edit modal with record data
  const handleOpenEditModal = (record) => {
    setEditForm({
      member_id: record.member_id,
      event_id: record.event_id,
      date: record.attendance_date,
      present: record.present,
      notes: record.notes || '',
    });
    setEditRecord(record);
    setEditError('');
    setEditModalVisible(true);
  };

  // Submit edit
  const handleEditSubmit = async () => {
    setEditError('');
    if (!editForm.member_id || !editForm.event_id || !editForm.date) {
      setEditError('Please fill all required fields.');
      return;
    }
    setEditSubmitting(true);
    try {
      const { error: updateError } = await supabase.from('attendance').update({
        member_id: editForm.member_id,
        event_id: editForm.event_id,
        attendance_date: editForm.date,
        present: editForm.present,
        notes: editForm.notes,
      }).eq('id', editRecord.id);
      if (updateError) {
        setEditError(updateError.message || 'Failed to update attendance.');
      } else {
        setEditModalVisible(false);
        fetchAttendance();
      }
    } catch (e) {
      setEditError('Failed to update attendance.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete attendance
  const handleDeleteAttendance = (id) => {
    Alert.alert('Delete Attendance', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('attendance').delete().eq('id', id);
        fetchAttendance();
      }},
    ]);
  };

  // Filtered members and events for search
  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(memberSearch.toLowerCase())
  );
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Logout" onPress={handleLogout} />
      <Text style={styles.title}>Attendance Records</Text>
      {success && (
        <View style={styles.toastSuccess}><Text style={styles.toastText}>Attendance recorded!</Text></View>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={fetchAttendance}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No attendance records found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Ionicons name="person" size={28} color="#007AFF" style={{ marginBottom: 8 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => handleOpenEditModal(item)}>
                    <Ionicons name="pencil" size={22} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAttendance(item.id)}>
                    <Ionicons name="trash" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.member}>{getMemberName(item)}</Text>
              <Text>Date: {item.attendance_date}</Text>
              <Text>Event: {item.events ? item.events.title : item.event_id}</Text>
              <Text>Present: {item.present ? 'Yes' : 'No'}</Text>
              {item.notes ? <Text>Notes: {item.notes}</Text> : null}
            </View>
          )}
        />
      )}
      {/* Floating Action Button for Record Attendance */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 32 }]} onPress={handleOpenModal}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      {/* Modal for recording attendance */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Attendance</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.label}>Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Search members..."
              value={memberSearch}
              onChangeText={setMemberSearch}
            />
            <View style={styles.pickerWrapper}>
              <FlatList
                data={filteredMembers}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, form.member_id === item.id && styles.pickerItemSelected]}
                    onPress={() => setForm(f => ({ ...f, member_id: item.id }))}
                  >
                    <Text style={form.member_id === item.id ? { color: '#fff' } : {}}>{item.first_name} {item.last_name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <Text style={styles.label}>Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Search events..."
              value={eventSearch}
              onChangeText={setEventSearch}
            />
            <View style={styles.pickerWrapper}>
              <FlatList
                data={filteredEvents}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, form.event_id === item.id && styles.pickerItemSelected]}
                    onPress={() => setForm(f => ({ ...f, event_id: item.id }))}
                  >
                    <Text style={form.event_id === item.id ? { color: '#fff' } : {}}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
              <Text>{form.date || 'Select date'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.date ? new Date(form.date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setForm(f => ({ ...f, date: date.toISOString().slice(0, 10) }));
                }}
              />
            )}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Present</Text>
              <Switch value={form.present} onValueChange={v => setForm(f => ({ ...f, present: v }))} />
            </View>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              value={form.notes}
              onChangeText={v => setForm(f => ({ ...f, notes: v }))}
              placeholder="Optional notes..."
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title={submitting ? 'Submitting...' : 'Submit'} onPress={handleSubmit} disabled={submitting || !form.member_id || !form.event_id || !form.date} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Floating Action Button for Mass Attendance */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 100 }]} onPress={handleOpenMassModal}>
        <Ionicons name="people" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Mass Attendance Modal */}
      <Modal visible={massModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Mass Attendance</Text>
            {massError ? <Text style={styles.errorText}>{massError}</Text> : null}
            <Text style={styles.label}>Event</Text>
            <ScrollView horizontal style={{ marginBottom: 8 }}>
              {events.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.pickerItem, massEventId === e.id && styles.pickerItemSelected]}
                  onPress={() => setMassEventId(e.id)}
                >
                  <Text style={massEventId === e.id ? { color: '#fff' } : {}}>{e.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setMassShowDatePicker(true)} style={styles.dateInput}>
              <Text>{massDate || 'Select date'}</Text>
            </TouchableOpacity>
            {massShowDatePicker && (
              <DateTimePicker
                value={massDate ? new Date(massDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setMassShowDatePicker(false);
                  if (date) setMassDate(date.toISOString().slice(0, 10));
                }}
              />
            )}
            <Text style={styles.label}>Members</Text>
            <ScrollView style={{ maxHeight: 300, marginBottom: 8 }}>
              {members.map(m => (
                <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Switch value={massAttendance[m.id]?.present ?? true} onValueChange={() => handleMassTogglePresent(m.id)} />
                  <Text style={{ flex: 1, marginLeft: 8 }}>{m.first_name} {m.last_name}</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    value={massAttendance[m.id]?.notes || ''}
                    onChangeText={v => handleMassNoteChange(m.id, v)}
                    placeholder="Notes..."
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setMassModalVisible(false)} />
              <Button title={massSubmitting ? 'Submitting...' : 'Submit'} onPress={handleMassSubmit} disabled={massSubmitting || !massEventId || !massDate} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Edit Attendance Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Attendance</Text>
            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setEditShowDatePicker(true)} style={styles.dateInput}>
              <Text>{editForm.date || 'Select date'}</Text>
            </TouchableOpacity>
            {editShowDatePicker && (
              <DateTimePicker
                value={editForm.date ? new Date(editForm.date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setEditShowDatePicker(false);
                  if (date) setEditForm(f => ({ ...f, date: date.toISOString().slice(0, 10) }));
                }}
              />
            )}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Present</Text>
              <Switch value={editForm.present} onValueChange={v => setEditForm(f => ({ ...f, present: v }))} />
            </View>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              value={editForm.notes}
              onChangeText={v => setEditForm(f => ({ ...f, notes: v }))}
              placeholder="Optional notes..."
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
              <Button title={editSubmitting ? 'Saving...' : 'Save'} onPress={handleEditSubmit} disabled={editSubmitting || !editForm.member_id || !editForm.event_id || !editForm.date} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  member: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  pickerWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pickerItem: {
    backgroundColor: '#f2f2f2',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#007AFF',
    color: '#fff',
  },
  dateInput: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  toastSuccess: {
    backgroundColor: '#4BB543',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 