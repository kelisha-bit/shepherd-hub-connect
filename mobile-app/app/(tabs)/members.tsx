import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator, TextInput, Image, Modal, TouchableOpacity, ScrollView, Button, Alert } from 'react-native';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

// Define Member type for state
interface Member {
  id: string;
  first_name: string;
  last_name: string;
  group?: string;
  profile_image_url?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
}

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Member>>({
    first_name: '',
    last_name: '',
    group: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, group, profile_image_url, email, phone_number, date_of_birth, address, city, country');
    if (error) {
      console.error('Error fetching members:', error);
    } else {
      setMembers((data as Member[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter((m: Member) =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const openMemberModal = (member: Member) => {
    setSelectedMember(member);
    setEditForm(member);
    setEditMode(false);
    setEditError('');
    setEditSuccess(false);
    setModalVisible(true);
  };

  const handleEdit = () => {
    if (selectedMember) setEditForm(selectedMember);
    setEditMode(true);
    setEditError('');
    setEditSuccess(false);
  };

  const handleEditChange = (field: keyof Member, value: string) => {
    setEditForm(f => ({ ...f, [field]: value }));
  };

  const handleEditSubmit = async () => {
    setEditError('');
    setEditSuccess(false);
    setEditSubmitting(true);
    try {
      if (!selectedMember) throw new Error('No member selected');
      const { error: updateError } = await supabase
        .from('members')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          group: editForm.group,
          profile_image_url: editForm.profile_image_url,
          email: editForm.email,
          phone_number: editForm.phone_number,
          date_of_birth: editForm.date_of_birth,
          address: editForm.address,
          city: editForm.city,
          country: editForm.country,
        })
        .eq('id', selectedMember.id);
      if (updateError) {
        setEditError(updateError.message || 'Failed to update member.');
      } else {
        setEditSuccess(true);
        setEditMode(false);
        fetchMembers();
        setSelectedMember({ ...selectedMember, ...editForm });
        setTimeout(() => setEditSuccess(false), 2000);
      }
    } catch (e) {
      setEditError('Failed to update member.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Image upload handler
  const handlePickImage = async () => {
    if (!selectedMember) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      const asset = result.assets[0];
      const fileExt = asset.uri.split('.').pop();
      const fileName = `${selectedMember.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage.from('profile-images').upload(filePath, blob, { upsert: true });
      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message);
        setUploading(false);
        return;
      }
      // Get public URL
      const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      if (urlData && urlData.publicUrl) {
        setEditForm(f => ({ ...f, profile_image_url: urlData.publicUrl }));
      }
      setUploading(false);
    }
  };

  // Summary metrics
  const totalMembers = members.length;
  const uniqueGroups = Array.from(new Set(members.map(m => m.group).filter(Boolean)));
  const uniqueCities = Array.from(new Set(members.map(m => m.city).filter(Boolean)));

  // Add member handler
  const handleAddChange = (field: keyof Member, value: string) => {
    setAddForm(f => ({ ...f, [field]: value }));
  };
  const handleAddSubmit = async () => {
    setAddError('');
    setAddSuccess(false);
    setAddSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('members')
        .insert([
          {
            first_name: addForm.first_name,
            last_name: addForm.last_name,
            group: addForm.group,
            email: addForm.email,
            phone_number: addForm.phone_number,
            date_of_birth: addForm.date_of_birth,
            address: addForm.address,
            city: addForm.city,
            country: addForm.country,
          },
        ]);
      if (insertError) {
        setAddError(insertError.message || 'Failed to add member.');
      } else {
        setAddSuccess(true);
        setAddForm({
          first_name: '', last_name: '', group: '', email: '', phone_number: '', date_of_birth: '', address: '', city: '', country: ''
        });
        fetchMembers();
        setTimeout(() => {
          setAddSuccess(false);
          setAddModalVisible(false);
        }, 1500);
      }
    } catch (e) {
      setAddError('Failed to add member.');
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{totalMembers}</Text><Text style={styles.summaryLabel}>Total Members</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{uniqueGroups.length}</Text><Text style={styles.summaryLabel}>Groups</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{uniqueCities.length}</Text><Text style={styles.summaryLabel}>Cities</Text></View>
      </ScrollView>
      {/* Add Member FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <MaterialIcons name="person-add" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Add Member Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
              <Text style={styles.modalName}>Add New Member</Text>
              {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
              {addSuccess ? <Text style={styles.successText}>Member added!</Text> : null}
              <TextInput style={styles.input} value={addForm.first_name} onChangeText={v => handleAddChange('first_name', v)} placeholder="First Name" />
              <TextInput style={styles.input} value={addForm.last_name} onChangeText={v => handleAddChange('last_name', v)} placeholder="Last Name" />
              <TextInput style={styles.input} value={addForm.group} onChangeText={v => handleAddChange('group', v)} placeholder="Group" />
              <TextInput style={styles.input} value={addForm.email} onChangeText={v => handleAddChange('email', v)} placeholder="Email" />
              <TextInput style={styles.input} value={addForm.phone_number} onChangeText={v => handleAddChange('phone_number', v)} placeholder="Phone Number" />
              <TextInput style={styles.input} value={addForm.date_of_birth} onChangeText={v => handleAddChange('date_of_birth', v)} placeholder="Birthday" />
              <TextInput style={styles.input} value={addForm.address} onChangeText={v => handleAddChange('address', v)} placeholder="Address" />
              <TextInput style={styles.input} value={addForm.city} onChangeText={v => handleAddChange('city', v)} placeholder="City" />
              <TextInput style={styles.input} value={addForm.country} onChangeText={v => handleAddChange('country', v)} placeholder="Country" />
              <View style={styles.modalActions}>
                <Button title="Cancel" onPress={() => setAddModalVisible(false)} />
                <Button title={addSubmitting ? 'Adding...' : 'Add'} onPress={handleAddSubmit} disabled={addSubmitting} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Existing UI */}
      <Text style={styles.title}>Members</Text>
      <TextInput
        style={styles.input}
        placeholder="Search members..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No members found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openMemberModal(item)}>
              <View style={styles.item}>
                {item.profile_image_url ? (
                  <Image
                    source={{ uri: item.profile_image_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <Ionicons name="person" size={48} color="#007AFF" style={{ marginBottom: 8 }} />
                )}
                <Text style={styles.member}>{item.first_name} {item.last_name}</Text>
                {item.group ? <Text>Group: {item.group}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {/* Member Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
              {editMode ? (
                <>
                  <Text style={styles.modalName}>Edit Member</Text>
                  {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
                  {editSuccess ? <Text style={styles.successText}>Member updated!</Text> : null}
                  <TextInput
                    style={styles.input}
                    value={editForm.first_name}
                    onChangeText={v => handleEditChange('first_name', v)}
                    placeholder="First Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.last_name}
                    onChangeText={v => handleEditChange('last_name', v)}
                    placeholder="Last Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.group || ''}
                    onChangeText={v => handleEditChange('group', v)}
                    placeholder="Group"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.profile_image_url || ''}
                    onChangeText={v => handleEditChange('profile_image_url', v)}
                    placeholder="Profile Image URL"
                  />
                  <TouchableOpacity style={styles.editPhotoBtn} onPress={handlePickImage} disabled={uploading}>
                    <Text style={styles.editPhotoBtnText}>{uploading ? 'Uploading...' : 'Edit Photo'}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={editForm.email || ''}
                    onChangeText={v => handleEditChange('email', v)}
                    placeholder="Email"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.phone_number || ''}
                    onChangeText={v => handleEditChange('phone_number', v)}
                    placeholder="Phone Number"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.date_of_birth || ''}
                    onChangeText={v => handleEditChange('date_of_birth', v)}
                    placeholder="Birthday"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.address || ''}
                    onChangeText={v => handleEditChange('address', v)}
                    placeholder="Address"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.city || ''}
                    onChangeText={v => handleEditChange('city', v)}
                    placeholder="City"
                  />
                  <TextInput
                    style={styles.input}
                    value={editForm.country || ''}
                    onChangeText={v => handleEditChange('country', v)}
                    placeholder="Country"
                  />
                  <View style={styles.modalActions}>
                    <Button title="Cancel" onPress={() => setEditMode(false)} />
                    <Button title={editSubmitting ? 'Saving...' : 'Save'} onPress={handleEditSubmit} disabled={editSubmitting} />
                  </View>
                </>
              ) : (
                <>
                  {selectedMember?.profile_image_url ? (
                    <Image source={{ uri: selectedMember.profile_image_url }} style={styles.largeAvatar} />
                  ) : (
                    <Ionicons name="person" size={80} color="#007AFF" style={{ marginBottom: 16 }} />
                  )}
                  <Text style={styles.modalName}>{selectedMember?.first_name} {selectedMember?.last_name}</Text>
                  {selectedMember?.group ? <Text style={styles.modalField}>Group: {selectedMember.group}</Text> : null}
                  {selectedMember?.email ? <Text style={styles.modalField}>Email: {selectedMember.email}</Text> : null}
                  {selectedMember?.phone_number ? <Text style={styles.modalField}>Phone: {selectedMember.phone_number}</Text> : null}
                  {selectedMember?.date_of_birth ? <Text style={styles.modalField}>Birthday: {selectedMember.date_of_birth}</Text> : null}
                  {selectedMember?.address ? <Text style={styles.modalField}>Address: {selectedMember.address}</Text> : null}
                  {selectedMember?.city ? <Text style={styles.modalField}>City: {selectedMember.city}</Text> : null}
                  {selectedMember?.country ? <Text style={styles.modalField}>Country: {selectedMember.country}</Text> : null}
                  <View style={styles.modalActions}>
                    <Button title="Edit" onPress={handleEdit} />
                    <Button title="Close" onPress={() => setModalVisible(false)} />
                  </View>
                </>
              )}
            </ScrollView>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: 250,
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
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  modalName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalField: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    width: 250,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#4BB543',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  editPhotoBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  editPhotoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 