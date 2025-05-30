import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  Fingerprint, 
  Bell, 
  Shield, 
  AlertTriangle,
  Trash2
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivacySecurityScreen: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;
  
  const [biometricLogin, setBiometricLogin] = React.useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = React.useState(false);
  const [dataSharing, setDataSharing] = React.useState(true);
  const [locationTracking, setLocationTracking] = React.useState(true);
  const [crashReporting, setCrashReporting] = React.useState(true);
  
  React.useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      try {
        const savedBiometricLogin = await AsyncStorage.getItem('security_biometricLogin');
        const savedTwoFactorAuth = await AsyncStorage.getItem('security_twoFactorAuth');
        const savedDataSharing = await AsyncStorage.getItem('privacy_dataSharing');
        const savedLocationTracking = await AsyncStorage.getItem('privacy_locationTracking');
        const savedCrashReporting = await AsyncStorage.getItem('privacy_crashReporting');
        
        if (savedBiometricLogin !== null) {
          setBiometricLogin(savedBiometricLogin === 'true');
        }
        
        if (savedTwoFactorAuth !== null) {
          setTwoFactorAuth(savedTwoFactorAuth === 'true');
        }
        
        if (savedDataSharing !== null) {
          setDataSharing(savedDataSharing === 'true');
        }
        
        if (savedLocationTracking !== null) {
          setLocationTracking(savedLocationTracking === 'true');
        }
        
        if (savedCrashReporting !== null) {
          setCrashReporting(savedCrashReporting === 'true');
        }
      } catch (error) {
        console.error("Error loading privacy & security settings:", error);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleBiometricLoginToggle = async (value: boolean) => {
    setBiometricLogin(value);
    try {
      await AsyncStorage.setItem('security_biometricLogin', value.toString());
      
      if (value) {
        // In a real app, we would set up biometric authentication here
        Alert.alert(
          "Biometric Login",
          "Biometric login has been enabled. You can now use your fingerprint or face to log in."
        );
      }
    } catch (error) {
      console.error("Error saving biometric login setting:", error);
    }
  };
  
  const handleTwoFactorAuthToggle = async (value: boolean) => {
    setTwoFactorAuth(value);
    try {
      await AsyncStorage.setItem('security_twoFactorAuth', value.toString());
      
      if (value) {
        // In a real app, we would set up 2FA here
        Alert.alert(
          "Two-Factor Authentication",
          "Two-factor authentication has been enabled. You will receive a verification code when logging in from a new device."
        );
      }
    } catch (error) {
      console.error("Error saving two-factor auth setting:", error);
    }
  };
  
  const handleDataSharingToggle = async (value: boolean) => {
    setDataSharing(value);
    try {
      await AsyncStorage.setItem('privacy_dataSharing', value.toString());
    } catch (error) {
      console.error("Error saving data sharing setting:", error);
    }
  };
  
  const handleLocationTrackingToggle = async (value: boolean) => {
    setLocationTracking(value);
    try {
      await AsyncStorage.setItem('privacy_locationTracking', value.toString());
    } catch (error) {
      console.error("Error saving location tracking setting:", error);
    }
  };
  
  const handleCrashReportingToggle = async (value: boolean) => {
    setCrashReporting(value);
    try {
      await AsyncStorage.setItem('privacy_crashReporting', value.toString());
    } catch (error) {
      console.error("Error saving crash reporting setting:", error);
    }
  };
  
  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "This would open the change password screen in a real app."
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            Alert.alert(
              "Account Deletion Request",
              "Your account deletion request has been submitted. You will receive an email with further instructions."
            );
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={handleChangePassword}
            >
              <View style={styles.settingItemLeft}>
                <Lock size={20} color={theme.textLight} style={styles.settingIcon} />
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Change Password</Text>
              </View>
              <ArrowLeft size={20} color={theme.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Fingerprint size={20} color={theme.textLight} style={styles.settingIcon} />
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Biometric Login</Text>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={handleBiometricLoginToggle}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={biometricLogin ? Colors.primary : Colors.card}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Shield size={20} color={theme.textLight} style={styles.settingIcon} />
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Two-Factor Authentication</Text>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={handleTwoFactorAuthToggle}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={twoFactorAuth ? Colors.primary : Colors.card}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy</Text>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Eye size={20} color={theme.textLight} style={styles.settingIcon} />
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Data Sharing</Text>
              </View>
              <Switch
                value={dataSharing}
                onValueChange={handleDataSharingToggle}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={dataSharing ? Colors.primary : Colors.card}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Bell size={20} color={theme.textLight} style={styles.settingIcon} />
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Location Tracking</Text>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={handleLocationTrackingToggle}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={locationTracking ? Colors.primary : Colors.card}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <AlertTriangle size={20} color={theme.textLight} style={styles.settingIcon} />
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Crash Reporting</Text>
              </View>
              <Switch
                value={crashReporting}
                onValueChange={handleCrashReportingToggle}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={crashReporting ? Colors.primary : Colors.card}
              />
            </View>
          </View>
          
          <Text style={styles.privacyNote}>
            We collect and process your data to provide and improve our services. 
            Your data is stored securely and is never sold to third parties.
            For more information, please read our Privacy Policy.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.deleteAccountButton, { backgroundColor: Colors.danger + '10' }]}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={20} color={Colors.danger} style={styles.deleteAccountIcon} />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
    lineHeight: 18,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  deleteAccountIcon: {
    marginRight: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.danger,
  },
});

export default PrivacySecurityScreen;