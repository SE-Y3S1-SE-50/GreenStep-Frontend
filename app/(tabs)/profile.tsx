import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Alert, 
  StatusBar,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { onboardingUtils } from '../../utils/onboarding';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Account settings state
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });
  
  // Notifications settings state
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    treeReminders: true,
    challengeUpdates: true,
    communityAlerts: false
  });
  
  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhoneNumber: false,
    dataSharing: true
  });

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next app launch. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await onboardingUtils.resetOnboarding();
            router.replace('/onboarding');
          },
        },
      ]
    );
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
          },
        },
      ]
    );
  };

  const handleSaveAccount = () => {
    // Validation
    if (!accountForm.firstName || !accountForm.lastName || !accountForm.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // In a real app, this would call an API to update the user profile
    Alert.alert('Success', 'Account settings updated successfully!');
    setShowAccountModal(false);
  };

  const handleSaveNotifications = () => {
    Alert.alert('Success', 'Notification preferences saved!');
    setShowNotificationsModal(false);
  };

  const handleSavePrivacy = () => {
    Alert.alert('Success', 'Privacy settings updated!');
    setShowPrivacyModal(false);
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'person-circle-outline' as const,
      onPress: () => setShowAccountModal(true),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline' as const,
      onPress: () => setShowNotificationsModal(true),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline' as const,
      onPress: () => setShowPrivacyModal(true),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: () => Alert.alert(
        'Help & Support',
        'For assistance:\n\n' +
        '📧 Email: support@greenstep.app\n' +
        '🌐 Website: greenstep.app/help\n' +
        '💬 Live Chat: Available 9am-5pm\n\n' +
        'We\'re here to help!'
      ),
    },
    {
      id: 'onboarding',
      title: 'View Onboarding',
      icon: 'book-outline' as const,
      onPress: handleResetOnboarding,
      color: '#0ea5e9',
    },
    {
      id: 'about',
      title: 'About GreenStep',
      icon: 'information-circle-outline' as const,
      onPress: () => Alert.alert(
        'About GreenStep',
        'Version 1.0.0\n\n' +
        '🌱 Plant trees, track growth, save the planet!\n\n' +
        'GreenStep helps you monitor and care for your trees while making a positive environmental impact.\n\n' +
        '© 2025 GreenStep. All rights reserved.'
      ),
    },
  ];

  return (
    <View style={styles.container}>
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
          </View>
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.username || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'user@greenstep.app'}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Trees</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>127</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>42kg</Text>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
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
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>GreenStep v1.0.0</Text>
      </ScrollView>

      {/* Account Settings Modal */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Settings</Text>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={accountForm.firstName}
                onChangeText={(value) => setAccountForm({...accountForm, firstName: value})}
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={accountForm.lastName}
                onChangeText={(value) => setAccountForm({...accountForm, lastName: value})}
                placeholder="Enter last name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={accountForm.email}
                onChangeText={(value) => setAccountForm({...accountForm, email: value})}
                placeholder="Enter email"
                keyboardType="email-address"
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
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAccount}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
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
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotifications}>
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy & Security</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
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
              />
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#0ea5e9" />
              <Text style={styles.infoText}>
                Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
              </Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePrivacy}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
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
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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