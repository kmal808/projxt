import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Alert
} from 'react-native';
import { useCrewsStore } from '@/store/crews-store';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Colors from '@/constants/colors';
import { X, Trash2, Edit, Mail, Phone, Plus } from 'lucide-react-native';
import { Crew, User } from '@/types';
import { Linking } from 'react-native';

interface ManageTeamModalProps {
  visible: boolean;
  onClose: () => void;
  crew: Crew | null;
  onAddMember: () => void;
}

export default function ManageTeamModal({ visible, onClose, crew, onAddMember }: ManageTeamModalProps) {
  const { removeMemberFromCrew } = useCrewsStore();
  const [members, setMembers] = useState<User[]>([]);
  
  useEffect(() => {
    if (crew) {
      setMembers(crew.members);
    }
  }, [crew]);
  
  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      "Remove Team Member",
      "Are you sure you want to remove this team member from the crew?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            if (crew) {
              removeMemberFromCrew(crew.id, memberId);
              // Update local state
              setMembers(prev => prev.filter(member => member.id !== memberId));
            }
          }
        }
      ]
    );
  };
  
  const handleEmailMember = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(err => {
      Alert.alert("Error", "Could not open email app");
    });
  };
  
  const handleCallMember = (phone: string) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }
    
    Linking.openURL(`tel:${phone}`).catch(err => {
      Alert.alert("Error", "Could not open phone app");
    });
  };
  
  const renderMemberItem = ({ item }: { item: User }) => {
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <Avatar 
            name={item.name} 
            size={40} 
            imageUrl={item.avatar}
          />
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberRole}>
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.memberActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEmailMember(item.email)}
          >
            <Mail size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCallMember(item.phone || '')}
          >
            <Phone size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleRemoveMember(item.id)}
          >
            <Trash2 size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Manage Team Members</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.headerActions}>
            <Text style={styles.subtitle}>
              {members.length} member{members.length !== 1 ? 's' : ''} in {crew?.name}
            </Text>
            <Button
              title="Add Member"
              size="small"
              leftIcon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => {
                onClose();
                onAddMember();
              }}
            />
          </View>
          
          {members.length > 0 ? (
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={item => item.id}
              style={styles.membersList}
              contentContainerStyle={styles.membersListContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No team members in this crew
              </Text>
              <Button
                title="Add Team Member"
                onPress={() => {
                  onClose();
                  onAddMember();
                }}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Close"
            variant="outline"
            onPress={onClose}
            style={styles.closeBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  membersList: {
    flex: 1,
  },
  membersListContent: {
    paddingBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.textLight,
  },
  memberActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 16,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  closeBtn: {
    width: '100%',
  },
});