import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Crew } from '@/types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Colors from '@/constants/colors';
import { Briefcase } from 'lucide-react-native';

interface CrewCardProps {
  crew: Crew;
  onPress?: () => void;
}

export const CrewCard: React.FC<CrewCardProps> = ({ crew, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{crew.name}</Text>
          <View style={styles.projectsContainer}>
            <Briefcase size={14} color={Colors.textLight} />
            <Text style={styles.projectsText}>
              {crew.projects.length} {crew.projects.length === 1 ? 'Project' : 'Projects'}
            </Text>
          </View>
        </View>
        
        <View style={styles.membersContainer}>
          <Text style={styles.membersTitle}>Team Members</Text>
          <View style={styles.avatarList}>
            {crew.members.slice(0, 3).map((member, index) => (
              <View key={member.id} style={[styles.avatarContainer, { zIndex: 10 - index }]}>
                <Avatar 
                  name={member.name} 
                  size={32} 
                  imageUrl={member.avatar}
                />
              </View>
            ))}
            
            {crew.members.length > 3 && (
              <View style={styles.moreContainer}>
                <Text style={styles.moreText}>+{crew.members.length - 3}</Text>
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
    color: Colors.text,
  },
  projectsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectsText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  membersContainer: {
    marginTop: 8,
  },
  membersTitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  avatarList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: -8,
    borderWidth: 2,
    borderColor: Colors.card,
    borderRadius: 16,
  },
  moreContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  moreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
});

export default CrewCard;