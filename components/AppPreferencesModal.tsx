import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { X, Sun, Moon, Smartphone, Clock, Wifi, WifiOff } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { useThemeStore, ThemeMode } from '@/store/theme-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
}

const AppPreferencesModal: React.FC<AppPreferencesModalProps> = ({ visible, onClose }) => {
  const { mode, setMode, isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;
  
  const [workingHours, setWorkingHours] = useState({
    start: '08:00',
    end: '17:00',
  });
  
  const [onlineStatus, setOnlineStatus] = useState('available');
  const [autoOffline, setAutoOffline] = useState(true);
  
  // Load saved preferences
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedWorkingHours = await AsyncStorage.getItem('preferences_workingHours');
        const savedOnlineStatus = await AsyncStorage.getItem('preferences_onlineStatus');
        const savedAutoOffline = await AsyncStorage.getItem('preferences_autoOffline');
        
        if (savedWorkingHours) {
          setWorkingHours(JSON.parse(savedWorkingHours));
        }
        
        if (savedOnlineStatus) {
          setOnlineStatus(savedOnlineStatus);
        }
        
        if (savedAutoOffline !== null) {
          setAutoOffline(savedAutoOffline === 'true');
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    
    if (visible) {
      loadPreferences();
    }
  }, [visible]);
  
  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };
  
  const handleAutoOfflineToggle = async (value: boolean) => {
    setAutoOffline(value);
    try {
      await AsyncStorage.setItem('preferences_autoOffline', value.toString());
    } catch (error) {
      console.error("Error saving auto offline setting:", error);
    }
  };
  
  const handleStatusChange = async (status: string) => {
    setOnlineStatus(status);
    try {
      await AsyncStorage.setItem('preferences_onlineStatus', status);
    } catch (error) {
      console.error("Error saving online status:", error);
    }
  };
  
  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('preferences_workingHours', JSON.stringify(workingHours));
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };
  
  const renderThemeOption = (themeMode: ThemeMode, label: string, icon: React.ReactNode) => {
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          mode === themeMode && styles.selectedThemeOption,
          { borderColor: theme.border }
        ]}
        onPress={() => handleThemeChange(themeMode)}
      >
        {icon}
        <Text style={[styles.themeLabel, { color: theme.text }]}>{label}</Text>
        {mode === themeMode && (
          <View style={[styles.checkmark, { backgroundColor: Colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };
  
  const renderStatusOption = (status: string, label: string, icon: React.ReactNode) => {
    return (
      <TouchableOpacity
        style={[
          styles.statusOption,
          onlineStatus === status && styles.selectedStatusOption,
          { borderColor: theme.border }
        ]}
        onPress={() => handleStatusChange(status)}
      >
        {icon}
        <Text style={[styles.statusLabel, { color: theme.text }]}>{label}</Text>
        {onlineStatus === status && (
          <View style={[styles.checkmark, { backgroundColor: Colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>App Preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
              <View style={styles.themeOptions}>
                {renderThemeOption('light', 'Light', <Sun size={24} color={theme.text} />)}
                {renderThemeOption('dark', 'Dark', <Moon size={24} color={theme.text} />)}
                {renderThemeOption('system', 'System', <Smartphone size={24} color={theme.text} />)}
              </View>
            </View>
            
            <View style={[styles.section, styles.divider, { borderTopColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Working Hours</Text>
              <View style={styles.workingHoursContainer}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeLabel, { color: theme.text }]}>Start</Text>
                  <View style={[styles.timeSelector, { backgroundColor: theme === Colors ? Colors.background : Colors.dark.card, borderColor: theme.border }]}>
                    <Clock size={16} color={theme.textLight} style={styles.timeIcon} />
                    <Text style={[styles.timeValue, { color: theme.text }]}>{workingHours.start}</Text>
                  </View>
                </View>
                
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeLabel, { color: theme.text }]}>End</Text>
                  <View style={[styles.timeSelector, { backgroundColor: theme === Colors ? Colors.background : Colors.dark.card, borderColor: theme.border }]}>
                    <Clock size={16} color={theme.textLight} style={styles.timeIcon} />
                    <Text style={[styles.timeValue, { color: theme.text }]}>{workingHours.end}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={[styles.section, styles.divider, { borderTopColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Online Status</Text>
              <View style={styles.statusOptions}>
                {renderStatusOption('available', 'Available', 
                  <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                )}
                {renderStatusOption('away', 'Away', 
                  <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
                )}
                {renderStatusOption('busy', 'Busy', 
                  <View style={[styles.statusDot, { backgroundColor: Colors.danger }]} />
                )}
                {renderStatusOption('offline', 'Offline', 
                  <View style={[styles.statusDot, { backgroundColor: Colors.textLight }]} />
                )}
              </View>
              
              <View style={styles.autoOfflineContainer}>
                <View style={styles.autoOfflineTextContainer}>
                  {autoOffline ? (
                    <WifiOff size={16} color={theme.textLight} style={styles.autoOfflineIcon} />
                  ) : (
                    <Wifi size={16} color={theme.textLight} style={styles.autoOfflineIcon} />
                  )}
                  <Text style={[styles.autoOfflineText, { color: theme.text }]}>
                    Automatically go offline outside working hours
                  </Text>
                </View>
                <Switch
                  value={autoOffline}
                  onValueChange={handleAutoOfflineToggle}
                  trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                  thumbColor={autoOffline ? Colors.primary : Colors.card}
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.button}
            />
            <Button
              title="Save Changes"
              variant="primary"
              onPress={handleSave}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  divider: {
    paddingTop: 24,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  selectedThemeOption: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  themeLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workingHoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  timeIcon: {
    marginRight: 8,
  },
  timeValue: {
    fontSize: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: '1%',
    position: 'relative',
  },
  selectedStatusOption: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  autoOfflineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  autoOfflineTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoOfflineIcon: {
    marginRight: 8,
  },
  autoOfflineText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default AppPreferencesModal;