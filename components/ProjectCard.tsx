import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Project } from '@/types';
import Card from './ui/Card';
import StatusBadge from './ui/StatusBadge';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Calendar, Users, MapPin } from 'lucide-react-native';

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const colors = useThemeColors();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{project.name}</Text>
            <Text style={[styles.projectNumber, { color: colors.textLight }]}>{project.number}</Text>
          </View>
          <StatusBadge status={project.status} />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.textLight} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {new Date(project.startDate).toLocaleDateString()} 
              {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ' - Ongoing'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Users size={16} color={colors.textLight} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {project.crews.length} {project.crews.length === 1 ? 'Crew' : 'Crews'} Assigned
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
              {project.location}
            </Text>
          </View>
        </View>
        
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.client, { color: colors.text }]}>{project.client}</Text>
          <Text style={[styles.budget, { color: colors.primary }]}>{formatCurrency(project.budget)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectNumber: {
    fontSize: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  client: {
    fontSize: 13,
    fontWeight: '500',
  },
  budget: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProjectCard;