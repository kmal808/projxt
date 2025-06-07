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
import Colors from '@/constants/colors';
import { X, Check, Building } from 'lucide-react-native';
import { Crew, Project } from '@/types';

interface AssignProjectModalProps {
  visible: boolean;
  onClose: () => void;
  crew: Crew | null;
}

export default function AssignProjectModal({ visible, onClose, crew }: AssignProjectModalProps) {
  const { assignProjectToCrew } = useCrewsStore();
  const { projects, fetchProjects } = useProjectsStore();
  
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (visible) {
      fetchProjects();
    }
  }, [visible]);
  
  useEffect(() => {
    if (crew && projects.length > 0) {
      // Filter out projects that are already assigned to this crew
      const unassignedProjects = projects.filter(
        project => !crew.projects.includes(project.id)
      );
      setAvailableProjects(unassignedProjects);
      setSelectedProjects([]);
    }
  }, [crew, projects]);
  
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };
  
  const handleSubmit = () => {
    if (!crew || selectedProjects.length === 0) return;
    
    setIsSubmitting(true);
    
    // Assign selected projects to crew
    selectedProjects.forEach(projectId => {
      assignProjectToCrew(crew.id, projectId);
    });
    
    // Reset and close modal
    setSelectedProjects([]);
    onClose();
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
    setSelectedProjects([]);
    onClose();
  };
  
  const renderProjectItem = ({ item }: { item: Project }) => {
    const isSelected = selectedProjects.includes(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleProjectSelection(item.id)}
        style={styles.projectItemContainer}
      >
        <Card style={[
          styles.projectItem,
          isSelected && styles.selectedProjectItem
        ]}>
          <View style={styles.projectItemContent}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={styles.projectNumber}>{item.number}</Text>
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
            <Text style={styles.modalTitle}>Assign Projects</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {availableProjects.length > 0 ? (
              <>
                <Text style={styles.subtitle}>
                  Select projects to assign to {crew?.name}
                </Text>
                
                <FlatList
                  data={availableProjects}
                  renderItem={renderProjectItem}
                  keyExtractor={item => item.id}
                  style={styles.projectsList}
                  contentContainerStyle={styles.projectsListContent}
                />
                
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionText}>
                    {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Building size={40} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>
                  No available projects to assign
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  All projects are already assigned to this crew or no projects exist.
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
                title="Assign Projects"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={selectedProjects.length === 0}
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
  projectsList: {
    flex: 1,
  },
  projectsListContent: {
    paddingBottom: 8,
  },
  projectItemContainer: {
    marginBottom: 8,
  },
  projectItem: {
    padding: 12,
  },
  selectedProjectItem: {
    borderColor: Colors.primary,
    borderWidth: 1,
    backgroundColor: Colors.primary + '10',
  },
  projectItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  projectNumber: {
    fontSize: 12,
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