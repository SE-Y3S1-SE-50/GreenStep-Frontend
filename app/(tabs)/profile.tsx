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

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  treesPlanted: number;
  daysActive: number;
  co2Saved: number;
}

interface ProfileScreenProps {
  user: User;
  onUpdateUser: (userData: Partial<User>) => void;
  onLogout: () => void;
}

export default function ProfileScreen({ user, onUpdateUser, onLogout }: ProfileScreenProps) {
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
  interface NotificationSettings {
    pushEnabled: boolean;
    emailEnabled: boolean;
    treeReminders: boolean;
    challengeUpdates: boolean;
    communityAlerts: boolean;
  }

  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    treeReminders: true,
    challengeUpdates: true,
    communityAlerts: false
  });
  
  // Privacy settings state
  interface PrivacySettings {
    profileVisible: boolean;
    showEmail: boolean;
    showPhoneNumber: boolean;
    dataSharing: boolean;
  }

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisible: true,
    showEmail: false,
    showPhoneNumber: false,
    dataSharing: true
  });

  const handleSaveAccount = () => {
    if (!accountForm.firstName || !accountForm.lastName || !accountForm.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    onUpdateUser({
      firstName: accountForm.firstName,
      lastName: accountForm.lastName,
      email: accountForm.email,
      phoneNumber: accountForm.phoneNumber
    });
    
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
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
      onPress: () => setShowAccountModal(true),
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
        'For assistance:\n\n' +
        '📧 Email: support@greenstep.app\n' +
        '🌐 Website: greenstep.app/help\n' +
        '💬 Live Chat: Available 9am-5pm\n\n' +
        'We\'re here to help!'
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
              : 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
          
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
                autoCapitalize="none"
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
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
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
            {[
              { key: 'pushEnabled' as keyof NotificationSettings, title: 'Push Notifications', desc: 'Receive push notifications on your device' },
              { key: 'emailEnabled' as keyof NotificationSettings, title: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'treeReminders' as keyof NotificationSettings, title: 'Tree Care Reminders', desc: 'Get reminded about watering and care' },
              { key: 'challengeUpdates' as keyof NotificationSettings, title: 'Challenge Updates', desc: 'Notifications about your challenges' },
              { key: 'communityAlerts' as keyof NotificationSettings, title: 'Community Alerts', desc: 'Updates from the GreenStep community' }
            ].map((item) => (
              <View key={item.key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.desc}</Text>
                </View>
                <Switch
                  value={notifications[item.key]}
                  onValueChange={(value) => setNotifications({...notifications, [item.key]: value})}
                  trackColor={{ false: '#d1d5db', true: '#86efac' }}
                  thumbColor={notifications[item.key] ? '#16a34a' : '#f4f4f5'}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotifications}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
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
            {[
              { key: 'profileVisible' as keyof PrivacySettings, title: 'Public Profile', desc: 'Make your profile visible to others' },
              { key: 'showEmail' as keyof PrivacySettings, title: 'Show Email', desc: 'Display email on your profile' },
              { key: 'showPhoneNumber' as keyof PrivacySettings, title: 'Show Phone Number', desc: 'Display phone on your profile' },
              { key: 'dataSharing' as keyof PrivacySettings, title: 'Data Sharing', desc: 'Share anonymous usage data to improve app' }
            ].map((item) => (
              <View key={item.key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.desc}</Text>
                </View>
                <Switch
                  value={privacy[item.key]}
                  onValueChange={(value) => setPrivacy({...privacy, [item.key]: value})}
                  trackColor={{ false: '#d1d5db', true: '#86efac' }}
                  thumbColor={privacy[item.key] ? '#16a34a' : '#f4f4f5'}
                />
              </View>
            ))}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#0ea5e9" />
              <Text style={styles.infoText}>
                Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
              </Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePrivacy}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
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
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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