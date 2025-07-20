import { SignOutButton } from '@/components/clerk/SignOutButton';
import { useSession, useUser } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserProfileScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) {
    // Handle loading state
    return null;
  }
  if (!isSignedIn) {
    // Handle signed out state
    return null;
  }

  
  const settingsItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: '👤',
      showArrow: true,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive updates and alerts',
      icon: '🔔',
      hasSwitch: true,
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode',
      subtitle: 'Toggle dark theme',
      icon: '🌙',
      hasSwitch: true,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location access',
      icon: '📍',
      hasSwitch: true,
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: '🔒',
      showArrow: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: '❓',
      showArrow: true,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'ℹ️',
      showArrow: true,
    },
  ];

  const getSwitchValue = (id:string) => {
    return {
      'notifications': notifications,
      'dark-mode': darkMode,
      'location': locationServices,
    }[id];
  };

  const handleSwitchToggle = (id:string, value:boolean) => {
    switch (id) {
      case 'notifications': setNotifications(value); break;
      case 'dark-mode': setDarkMode(value); break;
      case 'location': setLocationServices(value); break;
    }
  };

  const handleSettingPress = (id:string) => {
    Alert.alert('Tapped', `You tapped: ${id}`);
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.email}>{user.emailAddresses.toString()}</Text>
            <Text style={styles.meta}>Member since {user.createdAt?.toString()}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5.0</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingRow}
              onPress={() => handleSettingPress(item.id)}
              disabled={item.hasSwitch}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
              </View>
              {item.hasSwitch ? (
                <Switch
                  value={getSwitchValue(item.id)}
                  onValueChange={(value) => handleSwitchToggle(item.id, value)}
                />
              ) : item.showArrow ? (
                <Text style={{ fontSize: 18, color: '#999' }}>›</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity  style={styles.logoutButton}>

           <SignOutButton>
         
    </SignOutButton>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomColor: '#eee', borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },

  profileCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 16, backgroundColor: '#ddd' },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: '#111' },
  email: { fontSize: 14, color: '#666', marginTop: 2 },
  meta: { fontSize: 12, color: '#aaa', marginTop: 2 },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  statLabel: { fontSize: 12, color: '#666' },

  settingsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  icon: { fontSize: 20, width: 30, textAlign: 'center', marginRight: 8 },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#111' },
  settingSubtitle: { fontSize: 12, color: '#888' },

  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default UserProfileScreen;
