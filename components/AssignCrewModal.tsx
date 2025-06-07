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
  FlatList
} from 'react-native';
import { useCrewsStore } from '@/store/crews-store';
import { useProjectsStore } from '@/store/projects-store';
import Button from './ui/Button';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Colors from '@/constants/colors';
import { X, Check, Users } from 'lucide-react-native';
import { Crew, Project } from '@/types';

interface AssignCrewModalProps {
  visible: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function AssignCrewModal({ visible, onClose, project }: AssignCrewModalProps) {
  const { crews, fetchCrews, assignProjectToCrew } = useCrewsStore();
  const { updateProject } = useProjectsStore();
  
  const [selectedCrews, setSelectedCrews] = useState<string[]>([]);
  const [availableCrews, setAvailableCrews] = useState<Crew[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (visible) {
      fetchCrews();
    }
  }, [visible]);
  
  useEffect(() => {
    if (project && crews.length > 0) {
      // Initialize selected crews from project
      setSelectedCrews([...project.crews]);
      
      // Get all available crews
      setAvailableCrews(crews);
    }
  }, [project, crews, visible]);
  
  const toggleCrewSelection = (crewId: string) => {
    setSelectedCrews(prev => {
      if (prev.includes(crewId)) {
        return prev.filter(id => id !== crewId);
      } else {
        return [...prev, crewId];
      }
    });
  };
  
  const handleSubmit = () => {
    if (!project) return;
    
    setIsSubmitting(true);
    
    // Update project with selected crews
    updateProject(project.id, { crews: selectedCrews });
    
    // Assign project to each selected crew
    selectedCrews.forEach(crewId => {
      // Only assign if not already assigned
      if (!project.crews.includes(crewId)) {
        assignProjectToCrew(crewId, project.id);
      }
    });
    
    // Close modal
    onClose();
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
    // Reset to original project crews when canceling
    if (project) {
      setSelectedCrews([...project.crews]);
    }
    onClose();
  };
  
  const renderCrewItem = ({ item }: { item: Crew }) => {
    const isSelected = selectedCrews.includes(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleCrewSelection(item.id)}
        style={styles.crewItemContainer}
      >
        <Card style={[
          styles.crewItem,
          isSelected && styles.selectedCrewItem
        ]}>
          <View style={styles.crewItemContent}>
            <View style={styles.crewInfo}>
              <Text style={styles.crewName}>{item.name}</Text>
              <View style={styles.crewMembers}>
                {item.members.slice(0, 3).map((member, index) => (
                  <View key={member.id} style={[styles.crewMemberAvatar, { zIndex: 10 - index }]}>
                    <Avatar 
                      name={member.name} 
                      size={24} 
                      imageUrl={member.avatar}
                    />
                  </View>
                ))}
                
                {item.members.length > 3 && (
                  <View style={styles.moreMembersContainer}>
                    <Text style={styles.moreMembers}>+{item.members.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
            
            {isSelected && (
              <View style={styles.checkIconContainer}>
                <Check size={20} color={Colors.primary} />
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Crews</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {availableCrews.length > 0 ? (
              <>
                <Text style={styles.subtitle}>
                  Select crews to assign to this project
                </Text>
                
                <FlatList
                  data={availableCrews}
                  renderItem={renderCrewItem}
                  keyExtractor={item => item.id}
                  style={styles.crewsList}
                  contentContainerStyle={styles.crewsListContent}
                />
                
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionText}>
                    {selectedCrews.length} crew{selectedCrews.length !== 1 ? 's' : ''} selected
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Users size={40} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>
                  No crews available
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  No crews exist in the system. Create crews first.
                </Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Assign Crews"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={availableCrews.length === 0}
                style={styles.button}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
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
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  crewsList: {
    flex: 1,
  },
  crewsListContent: {
    paddingBottom: 8,
  },
  crewItemContainer: {
    marginBottom: 8,
  },
  crewItem: {
    padding: 12,
  },
  selectedCrewItem: {
    borderColor: Colors.primary,
    borderWidth: 1,
    backgroundColor: Colors.primary + '10',
  },
  crewItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  crewMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crewMemberAvatar: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: Colors.card,
    borderRadius: 12,
  },
  moreMembersContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  moreMembers: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionInfo: {
    marginTop: 8,
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});