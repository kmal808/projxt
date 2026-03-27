import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Crew } from '@/types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Briefcase } from 'lucide-react-native';

interface CrewCardProps {
  crew: Crew;
  onPress?: () => void;
}

export const CrewCard: React.FC<CrewCardProps> = ({ crew, onPress }) => {
  const colors = useThemeColors();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{crew.name}</Text>
          <View style={[styles.projectsContainer, { backgroundColor: colors.background }]}>
            <Briefcase size={14} color={colors.textLight} />
            <Text style={[styles.projectsText, { color: colors.textLight }]}>
              {crew.projects.length} {crew.projects.length === 1 ? 'Project' : 'Projects'}
            </Text>
          </View>
        </View>
        
        <View style={styles.membersContainer}>
          <Text style={[styles.membersTitle, { color: colors.textLight }]}>Team Members</Text>
          <View style={styles.avatarList}>
            {crew.members.slice(0, 3).map((member, index) => (
              <View key={member.id} style={[styles.avatarContainer, { zIndex: 10 - index, borderColor: colors.card }]}>
                <Avatar 
                  name={member.name} 
                  size={32} 
                  uri={member.avatar}
                />
              </View>
            ))}
            
            {crew.members.length > 3 && (
              <View style={[styles.moreContainer, { backgroundColor: colors.background, borderColor: colors.card }]}>
                <Text style={[styles.moreText, { color: colors.textLight }]}>+{crew.members.length - 3}</Text>
              </View>
            )}
          </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  membersContainer: {
    marginTop: 8,
  },
  membersTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  avatarList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: -8,
    borderWidth: 2,
    borderRadius: 16,
  },
  moreContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 2,
  },
  moreText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CrewCard;