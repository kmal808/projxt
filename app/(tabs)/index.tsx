import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import ProjectCard from '@/components/ProjectCard';
import CrewCard from '@/components/CrewCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import EmptyState from '@/components/ui/EmptyState';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useProjectsStore } from '@/store/projects-store';
import { useCrewsStore } from '@/store/crews-store';
import { Building, Users, DollarSign, Clock, ChevronRight, Package } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectsStore();
  const { crews, fetchCrews, isLoading: crewsLoading } = useCrewsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchProjects(), fetchCrews()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActiveProjects = () => {
    return projects.filter(project => project.status === 'active');
  };

  const getRecentProjects = () => {
    return [...projects]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 3);
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleCrewPress = (crewId: string) => {
    router.push(`/crew/${crewId}`);
  };

  const handleViewAllProjects = () => {
    router.push('/(tabs)/projects');
  };

  const handleViewAllCrews = () => {
    router.push('/(tabs)/crews');
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading dashboard..." />;
  }

  const activeProjects = getActiveProjects();
  const recentProjects = getRecentProjects();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader 
        title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'User'}`}
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Active Projects"
            value={activeProjects.length}
            icon={<Building size={16} color={Colors.primary} />}
            color={Colors.primary}
          />
          
          <StatCard
            title="Total Crews"
            value={crews.length}
            icon={<Users size={16} color={Colors.success} />}
            color={Colors.success}
          />
          
          <StatCard
            title="Budget"
            value={`$${(projects.reduce((sum, project) => sum + project.budget, 0) / 1000000).toFixed(1)}M`}
            icon={<DollarSign size={16} color={Colors.accent} />}
            color={Colors.accent}
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatCard
            title="Upcoming Deadlines"
            value="3"
            icon={<Clock size={16} color={Colors.secondary} />}
            color={Colors.secondary}
          />
        </View>
        
        {/* Recent Projects */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {projects.length > 0 && (
            <TouchableOpacity onPress={handleViewAllProjects} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {projectsLoading ? (
          <LoadingIndicator text="Loading projects..." />
        ) : recentProjects.length > 0 ? (
          <View style={styles.projectsList}>
            {recentProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => handleProjectPress(project.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No Projects Found"
            description="There are no projects to display at the moment."
            icon={<Building size={40} color={Colors.textLight} />}
            actionLabel="Add Project"
            onAction={() => router.push('/(tabs)/projects')}
          />
        )}
        
        {/* Crews */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Crews</Text>
              {crews.length > 0 && (
                <TouchableOpacity onPress={handleViewAllCrews} style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {crewsLoading ? (
              <LoadingIndicator text="Loading crews..." />
            ) : crews.length > 0 ? (
              <View style={styles.crewsList}>
                {crews.slice(0, 2).map(crew => (
                  <CrewCard
                    key={crew.id}
                    crew={crew}
                    onPress={() => handleCrewPress(crew.id)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No Crews Found"
                description="There are no crews to display at the moment."
                icon={<Users size={40} color={Colors.textLight} />}
                actionLabel="Add Crew"
                onAction={() => router.push('/(tabs)/crews')}
              />
            )}
          </>
        )}
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsList}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/payroll')}
            >
              <DollarSign size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Payroll</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/inventory')}
            >
              <Package size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/configurator')}
            >
              <Building size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Configurator</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  projectsList: {
    paddingHorizontal: 16,
  },
  crewsList: {
    paddingHorizontal: 16,
  },
  quickActionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  quickActionsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
});