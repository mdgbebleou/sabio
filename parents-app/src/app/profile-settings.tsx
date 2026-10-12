import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';

const BUCKET_NAME = 'userprofile'; 
export default function ProfileSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [accountId, setAccountId] = useState('');
  const [accountType, setAccountType] = useState('Parent / Guardian');
  const [accountStatus, setAccountStatus] = useState('Active');
  const [preferredContact, setPreferredContact] = useState<'Email' | 'WhatsApp' | 'In-App Notifications'>('Email');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login' as any);
        return;
      }

      setEmail(user.email || '');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        const combined = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
        const resolvedName = combined || profileData.full_name || profileData.name || user.user_metadata?.full_name || user.user_metadata?.name || '';
        
        setFullName(resolvedName);
        setPhone(profileData.phone || profileData.phone_number || '');
        setRelationship(profileData.relationship || 'Mother');
        setAccountId(profileData.account_id || `Parent-${user.id.slice(0, 8)}`);
        setAccountType(profileData.role || profileData.account_type || 'Parent / Guardian');
        setAccountStatus(profileData.status || 'Active');
        setPreferredContact(profileData.preferred_contact || 'Email');
        setAvatarUrl(profileData.avatar_url || null);
      } else {
        setAccountId(`Parent-${user.id.slice(0, 8)}`);
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

const handlePickAndUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access photo gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setIsUploadingPhoto(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; 

      // Fetch the file as a blob/arrayBuffer natively compatible with Supabase storage
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setAvatarUrl(publicUrl);
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', error.message || 'Could not upload profile picture.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone: phone,
        relationship: relationship,
        preferred_contact: preferredContact,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      Alert.alert('Success', 'Profile settings updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 16) }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {isUploadingPhoto ? (
            <ActivityIndicator size="small" color="#1e3a8a" />
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#94a3b8" />
            </View>
          )}
        </View>
        <Text style={[styles.profileNameText, { color: theme.text }]}>{fullName || 'Parent User'}</Text>
        <Text style={styles.profileRoleText}>{accountType}</Text>
        
        <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickAndUploadImage} disabled={isUploadingPhoto}>
          <Ionicons name="camera-outline" size={16} color="#1e3a8a" style={{ marginRight: 6 }} />
          <Text style={styles.changePhotoText}>{isUploadingPhoto ? 'Uploading...' : 'Change Photo'}</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.background, color: theme.textSecondary, borderColor: theme.border }]}
            value={email}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+233 XX XXX XXXX"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Relationship to Student</Text>
          <TouchableOpacity 
            style={[styles.dropdownContainer, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => {
              Alert.alert(
                'Relationship',
                'Select relationship',
                [
                  { text: 'Mother', onPress: () => setRelationship('Mother') },
                  { text: 'Father', onPress: () => setRelationship('Father') },
                  { text: 'Guardian', onPress: () => setRelationship('Guardian') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={{ color: theme.text, fontSize: 14 }}>{relationship}</Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Information */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>Account ID</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{accountId}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>Account Type</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{accountType}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>Account Status</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{accountStatus}</Text>
          </View>
        </View>
      </View>

      {/* Contact Preferences */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>CONTACT PREFERENCES</Text>
        <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Preferred Contact Method</Text>

        {(['Email', 'WhatsApp', 'In-App Notifications'] as const).map((method) => {
          const isSelected = preferredContact === method;
          return (
            <TouchableOpacity 
              key={method} 
              style={[styles.radioRow, { borderColor: isSelected ? '#2563eb' : theme.border, backgroundColor: isSelected ? '#eff6ff' : theme.background }]}
              onPress={() => setPreferredContact(method)}
            >
              <Text style={[styles.radioText, { color: isSelected ? '#1e3a8a' : theme.text }]}>{method}</Text>
              <View style={[styles.radioOuter, { borderColor: isSelected ? '#2563eb' : '#cbd5e1' }]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveChanges}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#94a3b8',
    width: '100%',
  },
  profileNameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileRoleText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
  subLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  saveButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
