import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator, Modal, TouchableOpacity, TextInput, Button, Platform, ScrollView, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form, setForm] = useState({ title: '', event_date: '', event_type: '' });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('id, title, event_date, event_type')
      .order('event_date', { ascending: false });
    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenModal = () => {
    setForm({ title: '', event_date: '', event_type: '' });
    setError('');
    setSuccess(false);
    setModalVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      event_date: event.event_date,
      event_type: event.event_type
    });
    setError('');
    setSuccess(false);
    setEditModalVisible(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setEditingEvent(event);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!editingEvent) return;
    
    setSubmitting(true);
    try {
      console.log('Deleting event with ID:', editingEvent.id);
      
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', editingEvent.id);
      
      console.log('Delete response:', { error: deleteError });
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
        setError(deleteError.message || 'Failed to delete event.');
      } else {
        console.log('Delete successful');
        setSuccess(true);
        setDeleteModalVisible(false);
        fetchEvents();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e) {
      console.error('Delete exception:', e);
      setError('Failed to delete event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);
    if (!form.title || !form.event_date || !form.event_type) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('events').insert(form);
      if (insertError) {
        setError(insertError.message || 'Failed to add event.');
      } else {
        setSuccess(true);
        setModalVisible(false);
        fetchEvents();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e) {
      setError('Failed to add event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEvent = async () => {
    setError('');
    setSuccess(false);
    if (!form.title || !form.event_date || !form.event_type) {
      setError('Please fill all required fields.');
      return;
    }
    if (!editingEvent?.id) {
      setError('No event selected for editing.');
      return;
    }
    setSubmitting(true);
    try {
      console.log('Updating event with ID:', editingEvent.id);
      console.log('Update data:', form);
      
      const { data, error: updateError } = await supabase
        .from('events')
        .update(form)
        .eq('id', editingEvent.id)
        .select();
      
      console.log('Update response:', { data, error: updateError });
      
      if (updateError) {
        console.error('Update error:', updateError);
        setError(updateError.message || 'Failed to update event.');
      } else {
        console.log('Update successful:', data);
        setSuccess(true);
        setEditModalVisible(false);
        fetchEvents();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e) {
      console.error('Update exception:', e);
      setError('Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <TextInput
        style={styles.input}
        placeholder="Search events..."
        value={search}
        onChangeText={setSearch}
      />
      {success && (
        <View style={styles.toastSuccess}><Text style={styles.toastText}>Event {editingEvent ? 'updated' : 'added'}!</Text></View>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={fetchEvents}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No events found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <MaterialIcons name="event" size={28} color="#007AFF" style={{ marginBottom: 8 }} />
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text>Date: {item.event_date}</Text>
              <Text>Type: {item.event_type}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => handleEditEvent(item)}
                >
                  <MaterialIcons name="edit" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => handleDeleteEvent(item)}
                >
                  <MaterialIcons name="delete" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      
      {/* Modal for adding event */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Event</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
              placeholder="Event title"
            />
            <Text style={styles.label}>Event Type</Text>
            <TextInput
              style={styles.input}
              value={form.event_type}
              onChangeText={v => setForm(f => ({ ...f, event_type: v }))}
              placeholder="Event type"
            />
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
              <Text>{form.event_date || 'Select date'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.event_date ? new Date(form.event_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setForm(f => ({ ...f, event_date: date.toISOString().slice(0, 10) }));
                }}
              />
            )}
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title={submitting ? 'Submitting...' : 'Submit'} onPress={handleSubmit} disabled={submitting || !form.title || !form.event_date || !form.event_type} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for editing event */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
              placeholder="Event title"
            />
            <Text style={styles.label}>Event Type</Text>
            <TextInput
              style={styles.input}
              value={form.event_type}
              onChangeText={v => setForm(f => ({ ...f, event_type: v }))}
              placeholder="Event type"
            />
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowEditDatePicker(true)} style={styles.dateInput}>
              <Text>{form.event_date || 'Select date'}</Text>
            </TouchableOpacity>
            {showEditDatePicker && (
              <DateTimePicker
                value={form.event_date ? new Date(form.event_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowEditDatePicker(false);
                  if (date) setForm(f => ({ ...f, event_date: date.toISOString().slice(0, 10) }));
                }}
              />
            )}
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
              <Button title={submitting ? 'Updating...' : 'Update'} onPress={handleUpdateEvent} disabled={submitting || !form.title || !form.event_date || !form.event_type} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for delete confirmation */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Event</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.deleteText}>
              Are you sure you want to delete "{editingEvent?.title}"? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setDeleteModalVisible(false)} />
              <Button 
                title={submitting ? 'Deleting...' : 'Delete'} 
                onPress={confirmDelete} 
                disabled={submitting}
                color="#FF3B30"
              />
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
  eventTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  deleteText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    lineHeight: 20,
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