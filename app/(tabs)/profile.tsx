import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

const API_URL = 'https://green-step-backend.vercel.app/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Modal visibility states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Account settings form state
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Notifications settings state
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    treeReminders: true,
    challengeUpdates: true,
    communityAlerts: false,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhoneNumber: false,
    dataSharing: true,
  });

  // Load saved preferences on mount
  useEffect(() => {
    loadNotificationPreferences();
    loadPrivacyPreferences();
  }, []);

  // Load notification preferences from AsyncStorage
  const loadNotificationPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('@notification_preferences');
      if (saved !== null) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  // Load privacy preferences from AsyncStorage
  const loadPrivacyPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('@privacy_preferences');
      if (saved !== null) {
        setPrivacy(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading privacy preferences:', error);
    }
  };

  // Save account settings
  const handleSaveAccount = async () => {
    if (!accountForm.firstName || !accountForm.lastName || !accountForm.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      // Send to backend API
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(accountForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user in AsyncStorage
        const updatedUser = { ...user, ...accountForm };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert('Success', 'Account settings updated successfully!');
        setShowAccountModal(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update account settings');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      Alert.alert('Error', 'Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('@notification_preferences', JSON.stringify(notifications));
      
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      // Send to backend API
      const response = await fetch(`${API_URL}/user/preferences/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      });

      if (response.ok) {
        Alert.alert('Success', 'Notification preferences saved!');
        setShowNotificationsModal(false);
      } else {
        // Even if API fails, data is saved locally
        Alert.alert('Success', 'Notification preferences saved locally!');
        setShowNotificationsModal(false);
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      // Still save locally even if API fails
      Alert.alert('Success', 'Notification preferences saved locally!');
      setShowNotificationsModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Save privacy settings
  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('@privacy_preferences', JSON.stringify(privacy));
      
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      // Send to backend API
      const response = await fetch(`${API_URL}/user/preferences/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(privacy),
      });

      if (response.ok) {
        Alert.alert('Success', 'Privacy settings updated!');
        setShowPrivacyModal(false);
      } else {
        // Even if API fails, data is saved locally
        Alert.alert('Success', 'Privacy settings saved locally!');
        setShowPrivacyModal(false);
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      // Still save locally even if API fails
      Alert.alert('Success', 'Privacy settings saved locally!');
      setShowPrivacyModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  interface MenuItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
  }

  const menuItems: MenuItem[] = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'person-circle-outline',
      onPress: () => {
        // Reset form to current user data when opening
        setAccountForm({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phoneNumber: user?.phoneNumber || '',
        });
        setShowAccountModal(true);
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => setShowNotificationsModal(true),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline',
      onPress: () => setShowPrivacyModal(true),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert(
        'Help & Support',
        'Need assistance?\n\n' +
        '📧 Email: support@greenstep.app\n' +
        '🌐 Website: greenstep.app/help\n' +
        '💬 Live Chat: Available 9am-5pm IST\n' +
        '📱 WhatsApp: +91-XXXX-XXXXXX\n\n' +
        'We typically respond within 24 hours!'
      ),
    },
    {
      id: 'about',
      title: 'About GreenStep',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert(
        'About GreenStep',
        'Version 1.0.0\n\n' +
        '🌱 Plant trees, track growth, save the planet!\n\n' +
        'GreenStep helps you monitor and care for your trees while making a positive environmental impact through parcel reforestation and comprehensive tree tracking.\n\n' +
        '🌍 Mission: Making the world greener, one tree at a time.\n\n' +
        '© 2025 GreenStep. All rights reserved.'
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#16a34a" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.username || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'No email provided'}
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="leaf-outline" size={20} color="#16a34a" />
                <Text style={styles.statValue}>{user?.treesPlanted || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Trees Planted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="calendar-outline" size={20} color="#16a34a" />
                <Text style={styles.statValue}>{user?.daysActive || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="leaf" size={20} color="#16a34a" />
                <Text style={styles.statValue}>{user?.co2Saved || 0}kg</Text>
              </View>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, item.color && { backgroundColor: item.color + '20' }]}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={item.color || '#16a34a'} 
                  />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>GreenStep v1.0.0</Text>
          <Text style={styles.footerText}>Made with 💚 for the Planet</Text>
        </View>
      </ScrollView>

      {/* Account Settings Modal */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Settings</Text>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={accountForm.firstName}
                onChangeText={(value) => setAccountForm({...accountForm, firstName: value})}
                placeholder="Enter first name"
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={accountForm.lastName}
                onChangeText={(value) => setAccountForm({...accountForm, lastName: value})}
                placeholder="Enter last name"
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={accountForm.email}
                onChangeText={(value) => setAccountForm({...accountForm, email: value})}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={accountForm.phoneNumber}
                onChangeText={(value) => setAccountForm({...accountForm, phoneNumber: value})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSaveAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive push notifications on your device</Text>
              </View>
              <Switch
                value={notifications.pushEnabled}
                onValueChange={(value) => setNotifications({...notifications, pushEnabled: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.pushEnabled ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive updates via email</Text>
              </View>
              <Switch
                value={notifications.emailEnabled}
                onValueChange={(value) => setNotifications({...notifications, emailEnabled: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.emailEnabled ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Tree Care Reminders</Text>
                <Text style={styles.settingDescription}>Get reminded about watering and care</Text>
              </View>
              <Switch
                value={notifications.treeReminders}
                onValueChange={(value) => setNotifications({...notifications, treeReminders: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.treeReminders ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Challenge Updates</Text>
                <Text style={styles.settingDescription}>Notifications about your challenges</Text>
              </View>
              <Switch
                value={notifications.challengeUpdates}
                onValueChange={(value) => setNotifications({...notifications, challengeUpdates: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.challengeUpdates ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Community Alerts</Text>
                <Text style={styles.settingDescription}>Updates from the GreenStep community</Text>
              </View>
              <Switch
                value={notifications.communityAlerts}
                onValueChange={(value) => setNotifications({...notifications, communityAlerts: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.communityAlerts ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSaveNotifications}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Preferences</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy & Security</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Public Profile</Text>
                <Text style={styles.settingDescription}>Make your profile visible to others</Text>
              </View>
              <Switch
                value={privacy.profileVisible}
                onValueChange={(value) => setPrivacy({...privacy, profileVisible: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={privacy.profileVisible ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Show Email</Text>
                <Text style={styles.settingDescription}>Display email on your profile</Text>
              </View>
              <Switch
                value={privacy.showEmail}
                onValueChange={(value) => setPrivacy({...privacy, showEmail: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={privacy.showEmail ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Show Phone Number</Text>
                <Text style={styles.settingDescription}>Display phone on your profile</Text>
              </View>
              <Switch
                value={privacy.showPhoneNumber}
                onValueChange={(value) => setPrivacy({...privacy, showPhoneNumber: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={privacy.showPhoneNumber ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Data Sharing</Text>
                <Text style={styles.settingDescription}>Share anonymous usage data to improve app</Text>
              </View>
              <Switch
                value={privacy.dataSharing}
                onValueChange={(value) => setPrivacy({...privacy, dataSharing: value})}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={privacy.dataSharing ? '#16a34a' : '#f4f4f5'}
                disabled={loading}
              />
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#0ea5e9" />
              <Text style={styles.infoText}>
                Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSavePrivacy}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#16a34a',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#16a34a',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  footerText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 11,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    marginLeft: 12,
    lineHeight: 20,
  },
});
