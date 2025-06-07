import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCrewsStore } from '@/store/crews-store';
import { useProjectsStore } from '@/store/projects-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Colors from '@/constants/colors';
import EditCrewModal from '@/components/EditCrewModal';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';
import AssignProjectModal from '@/components/AssignProjectModal';
import ManageTeamModal from '@/components/ManageTeamModal';
import { 
  Users, 
  Briefcase, 
  Edit2, 
  Trash2,
  Plus,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react-native';

export default function CrewDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { crews, fetchCrews, deleteCrew, removeProjectFromCrew } = useCrewsStore();
  const { projects, fetchProjects } = useProjectsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [crew, setCrew] = useState<any>(null);
  const [crewProjects, setCrewProjects] = useState<any[]>([]);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (crews.length === 0) {
          await fetchCrews();
        }
        if (projects.length === 0) {
          await fetchProjects();
        }
      } catch (error) {
        console.error("Error loading crew data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (crews.length > 0 && id) {
      const foundCrew = crews.find(c => c.id === id);
      setCrew(foundCrew);
      
      if (foundCrew && projects.length > 0) {
        const assignedProjects = projects.filter(project => 
          foundCrew.projects.includes(project.id)
        );
        setCrewProjects(assignedProjects);
      }
    }
  }, [id, crews, projects]);

  const handleEditCrew = () => {
    setShowEditModal(true);
  };

  const handleDeleteCrew = () => {
    Alert.alert(
      "Delete Crew",
      "Are you sure you want to delete this crew? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (id) {
              deleteCrew(id);
              router.back();
            }
          }
        }
      ]
    );
  };
  
  const handleRemoveProject = (projectId: string) => {
    Alert.alert(
      "Remove Project",
      "Are you sure you want to remove this project from the crew?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            if (id) {
              removeProjectFromCrew(id, projectId);
              // Update local state
              setCrewProjects(prev => prev.filter(project => project.id !== projectId));
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

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading crew details..." />;
  }

  if (!crew) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Crew Not Found" }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.danger} />
          <Text style={styles.errorTitle}>Crew Not Found</Text>
          <Text style={styles.errorMessage}>The crew you're looking for doesn't exist or has been deleted.</Text>
          <Button 
            title="Go Back" 
            onPress={() => router.back()} 
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Default empty schedule if not present
  const crewSchedule = crew.schedule || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: crew.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleEditCrew}
              >
                <Edit2 size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDeleteCrew}
              >
                <Trash2 size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.crewInfo}>
            <View style={styles.crewIconContainer}>
              <Users size={24} color={Colors.primary} />
            </View>
            <View style={styles.crewDetails}>
              <Text style={styles.crewName}>{crew.name}</Text>
              <View style={styles.crewStats}>
                <View style={styles.crewStat}>
                  <Text style={styles.crewStatValue}>{crew.members.length}</Text>
                  <Text style={styles.crewStatLabel}>Members</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.crewStat}>
                  <Text style={styles.crewStatValue}>{crew.projects.length}</Text>
                  <Text style={styles.crewStatLabel}>Projects</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddMemberModal(true)}
            >
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.membersList}>
            {crew.members.map((member: any) => (
              <Card key={member.id} style={styles.memberCard}>
                <View style={styles.memberContent}>
                  <Avatar 
                    name={member.name} 
                    size={50} 
                    imageUrl={member.avatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.memberActions}>
                    <TouchableOpacity 
                      style={styles.memberAction}
                      onPress={() => handleEmailMember(member.email)}
                    >
                      <Mail size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.memberAction}
                      onPress={() => handleCallMember(member.phone || '')}
                    >
                      <Phone size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
          
          <Button
            title="Manage Team Members"
            variant="outline"
            style={styles.manageButton}
            onPress={() => setShowManageTeamModal(true)}
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Projects</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAssignProjectModal(true)}
            >
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Assign Project</Text>
            </TouchableOpacity>
          </View>
          
          {crewProjects.length > 0 ? (
            <View style={styles.projectsList}>
              {crewProjects.map(project => (
                <Card key={project.id} style={styles.projectCard}>
                  <View style={styles.projectCardContent}>
                    <TouchableOpacity 
                      style={styles.projectInfo}
                      onPress={() => router.push(`/project/${project.id}`)}
                    >
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectNumber}>{project.number}</Text>
                    </TouchableOpacity>
                    <View style={styles.projectActions}>
                      <View style={styles.projectStatus}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
                        <Text style={styles.statusText}>{formatStatus(project.status)}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeProjectButton}
                        onPress={() => handleRemoveProject(project.id)}
                      >
                        <Trash2 size={16} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No projects assigned to this crew</Text>
              <Button
                title="Assign Project"
                size="small"
                leftIcon={<Plus size={16} color="#FFFFFF" />}
                style={styles.emptyButton}
                onPress={() => setShowAssignProjectModal(true)}
              />
            </Card>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Schedule</Text>
          </View>
          
          {crewSchedule.length > 0 ? (
            <View style={styles.scheduleList}>
              {crewSchedule.map((item: any) => (
                <Card key={item.id} style={styles.scheduleCard}>
                  <View style={styles.scheduleCardContent}>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleDate}>{new Date(item.date).toLocaleDateString()}</Text>
                      <Text style={styles.scheduleLocation}>{item.location}</Text>
                      <Text style={styles.scheduleDescription}>{item.description}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No schedule items available</Text>
              <Button
                title="View Schedule"
                size="small"
                leftIcon={<Briefcase size={16} color="#FFFFFF" />}
                style={styles.emptyButton}
                onPress={() => {
                  Alert.alert(
                    "Schedule Management",
                    "Schedule management will be available in a future update."
                  );
                }}
              />
            </Card>
          )}
        </View>
      </ScrollView>
      
      {/* Modals */}
      <EditCrewModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        crew={crew}
      />
      
      <AddTeamMemberModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        crew={crew}
      />
      
      <AssignProjectModal
        visible={showAssignProjectModal}
        onClose={() => setShowAssignProjectModal(false)}
        crew={crew}
      />
      
      <ManageTeamModal
        visible={showManageTeamModal}
        onClose={() => setShowManageTeamModal(false)}
        crew={crew}
        onAddMember={() => setShowAddMemberModal(true)}
      />
    </SafeAreaView>
  );
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return Colors.primary;
    case 'completed':
      return Colors.success;
    case 'pending':
      return Colors.warning;
    case 'on-hold':
      return Colors.secondary;
    default:
      return Colors.textLight;
  }
};

const formatStatus = (status: string) => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  crewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crewIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  crewDetails: {
    flex: 1,
  },
  crewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  crewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crewStat: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  crewStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  crewStatLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
  },
  membersList: {
    marginBottom: 16,
  },
  memberCard: {
    marginBottom: 8,
    padding: 12,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
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
  memberAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  manageButton: {
    marginBottom: 16,
  },
  projectsList: {
    marginBottom: 16,
  },
  projectCard: {
    marginBottom: 8,
    padding: 12,
  },
  projectCardContent: {
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
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  removeProjectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.danger + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleList: {
    marginBottom: 16,
  },
  scheduleCard: {
    marginBottom: 8,
    padding: 12,
  },
  scheduleCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  scheduleLocation: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
});