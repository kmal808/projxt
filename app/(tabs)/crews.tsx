import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCrewsStore } from '@/store/crews-store';
import CrewCard from '@/components/CrewCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import AddCrewModal from '@/components/AddCrewModal';
import Colors from '@/constants/colors';
import { Users, Plus } from 'lucide-react-native';

export default function CrewsScreen() {
  const router = useRouter();
  const { crews, fetchCrews, isLoading } = useCrewsStore();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    fetchCrews();
  }, []);

  const handleCrewPress = (crewId: string) => {
    router.push(`/crew/${crewId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crews</Text>
        <Button
          title="Add Crew"
          size="small"
          leftIcon={<Plus size={16} color="#FFFFFF" />}
          onPress={() => setIsAddModalVisible(true)}
        />
      </View>
      
      {isLoading ? (
        <LoadingIndicator fullScreen text="Loading crews..." />
      ) : crews.length > 0 ? (
        <FlatList
          data={crews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.crewCardContainer}>
              <CrewCard
                crew={item}
                onPress={() => handleCrewPress(item.id)}
              />
            </View>
          )}
          contentContainerStyle={styles.crewsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No Crews Found"
          description="There are no crews to display at the moment."
          icon={<Users size={40} color={Colors.textLight} />}
          actionLabel="Add Crew"
          onAction={() => setIsAddModalVisible(true)}
        />
      )}
      
      <AddCrewModal 
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
  crewsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  crewCardContainer: {
    marginBottom: 8,
  },
});