import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator, Modal, TouchableOpacity, TextInput, Button, Platform } from 'react-native';
import { supabase } from '../../supabaseClient';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Add types for donation and member
interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  donation_date: string;
  donation_type: string;
}

interface Member {
  id: string;
  name: string;
}

export default function DonationsScreen() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ donor_name: '', amount: '', donation_date: '', donation_type: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Member selection states
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [useOtherDonor, setUseOtherDonor] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('donations')
      .select('id, donor_name, amount, donation_date, donation_type')
      .order('donation_date', { ascending: false });
    if (error) {
      console.error('Error fetching donations:', error);
    } else {
      setDonations(data || []);
    }
    setLoading(false);
  }, []);

  // Fetch members when modal opens
  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('members')
      .select('id, name');
    if (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } else {
      setMembers(data || []);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleOpenModal = () => {
    setForm({ donor_name: '', amount: '', donation_date: '', donation_type: '' });
    setError('');
    setSuccess(false);
    setSelectedMember(null);
    setUseOtherDonor(false);
    setMemberSearch('');
    setModalVisible(true);
    fetchMembers();
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);
    let donorName = useOtherDonor ? form.donor_name : (selectedMember ? selectedMember.name : '');
    if (!donorName || !form.amount || !form.donation_date || !form.donation_type) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('donations').insert({
        donor_name: donorName,
        amount: parseFloat(form.amount),
        donation_date: form.donation_date,
        donation_type: form.donation_type,
      });
      if (insertError) {
        setError(insertError.message || 'Failed to add donation.');
      } else {
        setSuccess(true);
        setModalVisible(false);
        fetchDonations();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e) {
      setError('Failed to add donation.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonations = donations.filter(d =>
    d.donor_name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter members for the picker
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Donations</Text>
      <TextInput
        style={styles.input}
        placeholder="Search donations..."
        value={search}
        onChangeText={setSearch}
      />
      {success && (
        <View style={styles.toastSuccess}><Text style={styles.toastText}>Donation added!</Text></View>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={fetchDonations}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No donations found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <FontAwesome name="money" size={28} color="#007AFF" style={{ marginBottom: 8 }} />
              <Text style={styles.donor}>{item.donor_name}</Text>
              <Text>Amount: {item.amount}</Text>
              <Text>Date: {item.donation_date}</Text>
              <Text>Type: {item.donation_type}</Text>
            </View>
          )}
        />
      )}
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
        <FontAwesome name="plus" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Modal for adding donation */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Donation</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.label}>Donor</Text>
            {/* Member Picker or Other */}
            {!useOtherDonor && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Search members..."
                  value={memberSearch}
                  onChangeText={setMemberSearch}
                />
                <FlatList
                  data={filteredMembers}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 120, marginBottom: 8 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ padding: 8, backgroundColor: selectedMember && selectedMember.id === item.id ? '#e0e0e0' : '#fff', borderRadius: 6, marginBottom: 4 }}
                      onPress={() => { setSelectedMember(item); setForm(f => ({ ...f, donor_name: '' })); }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>No members found.</Text>}
                />
                <TouchableOpacity onPress={() => { setUseOtherDonor(true); setSelectedMember(null); }} style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#007AFF', textAlign: 'center' }}>Other (Non-member)</Text>
                </TouchableOpacity>
              </>
            )}
            {/* Manual donor name input if Other is selected */}
            {useOtherDonor && (
              <>
                <TextInput
                  style={styles.input}
                  value={form.donor_name}
                  onChangeText={v => setForm(f => ({ ...f, donor_name: v }))}
                  placeholder="Donor name"
                />
                <TouchableOpacity onPress={() => setUseOtherDonor(false)} style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#007AFF', textAlign: 'center' }}>Select from members</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={form.amount}
              onChangeText={v => setForm(f => ({ ...f, amount: v }))}
              placeholder="Amount"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Donation Type</Text>
            <TextInput
              style={styles.input}
              value={form.donation_type}
              onChangeText={v => setForm(f => ({ ...f, donation_type: v }))}
              placeholder="Donation type"
            />
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
              <Text>{form.donation_date || 'Select date'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.donation_date ? new Date(form.donation_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setForm(f => ({ ...f, donation_date: date.toISOString().slice(0, 10) }));
                }}
              />
            )}
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title={submitting ? 'Submitting...' : 'Submit'} onPress={handleSubmit} disabled={submitting || (!useOtherDonor && !selectedMember) || (useOtherDonor && !form.donor_name) || !form.amount || !form.donation_date || !form.donation_type} />
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
  donor: {
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
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