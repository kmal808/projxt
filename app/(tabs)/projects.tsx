import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProjectsStore } from '@/store/projects-store';
import ProjectCard from '@/components/ProjectCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import AddProjectModal from '@/components/AddProjectModal';
import Colors from '@/constants/colors';
import { Building, Plus, Filter } from 'lucide-react-native';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, fetchProjects, isLoading } = useProjectsStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed' | 'on-hold'>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectPress = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const getFilteredProjects = () => {
    if (filter === 'all') return projects;
    return projects.filter(project => project.status === filter);
  };

  const renderFilterButton = (
    label: string, 
    value: 'all' | 'active' | 'pending' | 'completed' | 'on-hold'
  ) => {
    const isActive = filter === value;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }
        ]}
        onPress={() => setFilter(value)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && { color: Colors.primary }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <Button
          title="Add Project"
          size="small"
          leftIcon={<Plus size={16} color="#FFFFFF" />}
          onPress={() => setIsAddModalVisible(true)}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterButtonsContainer}>
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Active', 'active')}
          {renderFilterButton('Pending', 'pending')}
          {renderFilterButton('Completed', 'completed')}
          {renderFilterButton('On Hold', 'on-hold')}
        </View>
        
        <TouchableOpacity style={styles.moreFiltersButton}>
          <Filter size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <LoadingIndicator fullScreen text="Loading projects..." />
      ) : getFilteredProjects().length > 0 ? (
        <FlatList
          data={getFilteredProjects()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.projectCardContainer}>
              <ProjectCard
                project={item}
                onPress={() => handleProjectPress(item.id)}
              />
            </View>
          )}
          contentContainerStyle={styles.projectsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title={`No ${filter !== 'all' ? filter : ''} Projects Found`}
          description="There are no projects to display at the moment."
          icon={<Building size={40} color={Colors.textLight} />}
          actionLabel="Add Project"
          onAction={() => setIsAddModalVisible(true)}
        />
      )}
      
      <AddProjectModal 
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'scroll',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textLight,
  },
  moreFiltersButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  projectCardContainer: {
    marginBottom: 8,
  },
});