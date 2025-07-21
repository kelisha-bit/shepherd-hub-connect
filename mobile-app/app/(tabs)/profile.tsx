import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile(user);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : profile ? (
        <View style={styles.item}>
          <Ionicons name="person-circle" size={48} color="#007AFF" style={{ marginBottom: 12 }} />
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{profile.id}</Text>
        </View>
      ) : (
        <Text>No profile found.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingTop: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 4,
  },
}); 