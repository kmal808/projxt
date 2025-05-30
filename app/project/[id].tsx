import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProjectsStore } from '@/store/projects-store';
import { useCrewsStore } from '@/store/crews-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Avatar from '@/components/ui/Avatar';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Colors from '@/constants/colors';
import { Task } from '@/types';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  ClipboardList, 
  Edit2, 
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react-native';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { projects, fetchProjects, deleteProject } = useProjectsStore();
  const { crews, fetchCrews } = useCrewsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [assignedCrews, setAssignedCrews] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (projects.length === 0) {
          await fetchProjects();
        }
        if (crews.length === 0) {
          await fetchCrews();
        }
      } catch (error) {
        console.error("Error loading project data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && id) {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject);
      
      if (foundProject && crews.length > 0) {
        const projectCrews = crews.filter(crew => 
          foundProject.crews.includes(crew.id)
        );
        setAssignedCrews(projectCrews);
      }
    }
  }, [id, projects, crews]);

  const handleEditProject = () => {
    // In a real app, navigate to edit form
    Alert.alert("Edit Project", "This would open the edit project form");
  };

  const handleDeleteProject = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone.",
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
              deleteProject(id);
              router.back();
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysRemaining = () => {
    if (!project.endDate) return "No deadline";
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days remaining` : "Past deadline";
  };

  const calculateProgress = () => {
    // In a real app, this would be based on completed tasks or milestones
    // For demo, we'll use a random value between 0-100
    return Math.floor(Math.random() * 100);
  };

  // Mock tasks for demo - with all required properties
  const mockTasks: Task[] = [
    { 
      id: 't1', 
      projectId: id as string, 
      title: 'Site preparation', 
      status: 'completed' as const, 
      assignedTo: 'John Smith',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: 't2', 
      projectId: id as string, 
      title: 'Foundation work', 
      status: 'in_progress' as const, 
      assignedTo: 'Mike Johnson',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: 't3', 
      projectId: id as string, 
      title: 'Framing', 
      status: 'todo' as const, 
      assignedTo: 'Sarah Williams',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: 't4', 
      projectId: id as string, 
      title: 'Electrical installation', 
      status: 'todo' as const, 
      assignedTo: 'David Brown',
      priority: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ];

  // Default empty documents array if not present
  const projectDocuments = project?.documents || [];

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading project details..." />;
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Project Not Found" }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.danger} />
          <Text style={styles.errorTitle}>Project Not Found</Text>
          <Text style={styles.errorMessage}>The project you're looking for doesn't exist or has been deleted.</Text>
          <Button 
            title="Go Back" 
            onPress={() => router.back()} 
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Default empty tasks array if not present
  const projectTasks = project.tasks || mockTasks;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: project.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleEditProject}
              >
                <Edit2 size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDeleteProject}
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
          <View style={styles.projectInfo}>
            <Text style={styles.projectNumber}>{project.number}</Text>
            <StatusBadge status={project.status} />
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${calculateProgress()}%` }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{calculateProgress()}% Complete</Text>
              <Text style={styles.progressText}>{calculateDaysRemaining()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.detailsSection}>
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Timeline</Text>
                <Text style={styles.detailValue}>
                  {new Date(project.startDate).toLocaleDateString()} 
                  {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ' - Ongoing'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{project.location}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <DollarSign size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>{formatCurrency(project.budget)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Users size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Client</Text>
                <Text style={styles.detailValue}>{project.client}</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Crews</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Assign Crew</Text>
            </TouchableOpacity>
          </View>
          
          {assignedCrews.length > 0 ? (
            <View style={styles.crewsList}>
              {assignedCrews.map(crew => (
                <Card key={crew.id} style={styles.crewCard}>
                  <TouchableOpacity 
                    style={styles.crewCardContent}
                    onPress={() => router.push(`/crew/${crew.id}`)}
                  >
                    <Text style={styles.crewName}>{crew.name}</Text>
                    <View style={styles.crewMembers}>
                      {crew.members.slice(0, 3).map((member: any, index: number) => (
                        <View key={member.id} style={[styles.crewMemberAvatar, { zIndex: 10 - index }]}>
                          <Avatar 
                            name={member.name} 
                            size={28} 
                            imageUrl={member.avatar}
                          />
                        </View>
                      ))}
                      
                      {crew.members.length > 3 && (
                        <View style={styles.moreMembersContainer}>
                          <Text style={styles.moreMembers}>+{crew.members.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No crews assigned to this project</Text>
              <Button
                title="Assign Crew"
                size="small"
                leftIcon={<Plus size={16} color="#FFFFFF" />}
                style={styles.emptyButton}
                onPress={() => {}}
              />
            </Card>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tasksList}>
            {projectTasks.map((task: Task) => (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <StatusBadge status={task.status} size="small" />
                </View>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskAssignee}>Assigned to: {task.assignedTo}</Text>
                  {task.status === 'completed' && (
                    <View style={styles.taskStatusIcon}>
                      <CheckCircle size={16} color={Colors.success} />
                    </View>
                  )}
                  {task.status === 'in_progress' && (
                    <View style={styles.taskStatusIcon}>
                      <Clock size={16} color={Colors.primary} />
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
          
          <Button
            title="View All Tasks"
            variant="outline"
            style={styles.viewAllButton}
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Document</Text>
            </TouchableOpacity>
          </View>
          
          {projectDocuments.length > 0 ? (
            <View style={styles.documentsList}>
              {projectDocuments.map((doc: any) => (
                <Card key={doc.id} style={styles.documentCard}>
                  <TouchableOpacity style={styles.documentCardContent}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <Text style={styles.documentType}>{doc.type}</Text>
                    <Text style={styles.documentUploadInfo}>
                      Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No documents uploaded yet</Text>
              <Button
                title="Upload Document"
                size="small"
                leftIcon={<Plus size={16} color="#FFFFFF" />}
                style={styles.emptyButton}
                onPress={() => {}}
              />
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectNumber: {
    fontSize: 14,
    color: Colors.textLight,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  detailsSection: {
    padding: 16,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
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
  crewsList: {
    marginBottom: 16,
  },
  crewCard: {
    marginBottom: 8,
    padding: 12,
  },
  crewCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crewName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  crewMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crewMemberAvatar: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: Colors.card,
    borderRadius: 14,
  },
  moreMembersContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  tasksList: {
    marginBottom: 16,
  },
  taskCard: {
    marginBottom: 8,
    padding: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskAssignee: {
    fontSize: 12,
    color: Colors.textLight,
  },
  taskStatusIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    marginTop: 8,
  },
  documentsList: {
    marginBottom: 16,
  },
  documentCard: {
    marginBottom: 8,
    padding: 12,
  },
  documentCardContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 4,
  },
  documentUploadInfo: {
    fontSize: 10,
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