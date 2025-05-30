import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { Package, Plus, Search, Filter, Download, Trash2 } from 'lucide-react-native';
import { useInventoryStore } from '@/store/inventory-store';
import AddInventoryModal from '@/components/AddInventoryModal';
import { InventoryItem } from '@/types';

export default function InventoryScreen() {
  const { items, deleteItem } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>(undefined);

  const uniqueJobs = [...new Set(items.map(item => item.jobName))];
  const itemTypes = [...new Set(items.map(item => item.itemType))];

  const getFilteredItems = () => {
    return items.filter(item => {
      const matchesSearch = 
        item.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturerOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesJobFilter = selectedJobFilter === 'all' || item.jobName === selectedJobFilter;
      const matchesTypeFilter = selectedTypeFilter === 'all' || item.itemType === selectedTypeFilter;
      
      return matchesSearch && matchesJobFilter && matchesTypeFilter;
    });
  };

  const formatItemType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAddItem = () => {
    setEditItem(undefined);
    setAddModalVisible(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setAddModalVisible(true);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this inventory item?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteItem(id),
          style: "destructive"
        }
      ]
    );
  };

  const exportInventory = async () => {
    try {
      // Create CSV content
      const filteredItems = getFilteredItems();
      let csvContent = "Job Name,Job Number,Order Number,Item Type,Quantity,Notes,Date Added\n";
      
      filteredItems.forEach(item => {
        csvContent += `"${item.jobName}","${item.jobNumber}","${item.manufacturerOrderNumber}","${formatItemType(item.itemType)}",${item.quantity},"${item.notes || ''}","${item.dateAdded}"\n`;
      });
      
      // Share the CSV
      await Share.share({
        message: csvContent,
        title: "Projxt Inventory Export"
      });
    } catch (error) {
      Alert.alert("Export Failed", "There was an error exporting the inventory data.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Button
          title="Add Item"
          size="small"
          leftIcon={<Plus size={16} color="#FFFFFF" />}
          onPress={handleAddItem}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedJobFilter === 'all' && styles.activeFilterChip
            ]}
            onPress={() => setSelectedJobFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedJobFilter === 'all' && styles.activeFilterChipText
              ]}
            >
              All Jobs
            </Text>
          </TouchableOpacity>
          
          {uniqueJobs.map(job => (
            <TouchableOpacity
              key={job}
              style={[
                styles.filterChip,
                selectedJobFilter === job && styles.activeFilterChip
              ]}
              onPress={() => setSelectedJobFilter(job)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedJobFilter === job && styles.activeFilterChipText
                ]}
              >
                {job}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedTypeFilter === 'all' && styles.activeFilterChip
            ]}
            onPress={() => setSelectedTypeFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedTypeFilter === 'all' && styles.activeFilterChipText
              ]}
            >
              All Types
            </Text>
          </TouchableOpacity>
          
          {itemTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                selectedTypeFilter === type && styles.activeFilterChip
              ]}
              onPress={() => setSelectedTypeFilter(type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedTypeFilter === type && styles.activeFilterChipText
                ]}
              >
                {formatItemType(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={exportInventory}
        >
          <Download size={16} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.inventoryList}
        contentContainerStyle={styles.inventoryListContent}
        showsVerticalScrollIndicator={false}
      >
        {getFilteredItems().length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateTitle}>No inventory items found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery || selectedJobFilter !== 'all' || selectedTypeFilter !== 'all'
                ? "Try adjusting your filters or search query"
                : "Add your first inventory item to get started"}
            </Text>
            {!searchQuery && selectedJobFilter === 'all' && selectedTypeFilter === 'all' && (
              <Button
                title="Add Item"
                onPress={handleAddItem}
                style={styles.emptyStateButton}
              />
            )}
          </View>
        ) : (
          getFilteredItems().map(item => (
            <Card key={item.id} style={styles.inventoryCard}>
              <View style={styles.inventoryCardHeader}>
                <View style={styles.inventoryTypeContainer}>
                  <Package size={16} color={Colors.primary} />
                  <Text style={styles.inventoryType}>{formatItemType(item.itemType)}</Text>
                </View>
                <Text style={styles.inventoryDate}>{new Date(item.dateAdded).toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.inventoryCardBody}>
                <View style={styles.inventoryDetail}>
                  <Text style={styles.inventoryDetailLabel}>Job:</Text>
                  <Text style={styles.inventoryDetailValue}>{item.jobName}</Text>
                </View>
                
                <View style={styles.inventoryDetail}>
                  <Text style={styles.inventoryDetailLabel}>Job #:</Text>
                  <Text style={styles.inventoryDetailValue}>{item.jobNumber}</Text>
                </View>
                
                <View style={styles.inventoryDetail}>
                  <Text style={styles.inventoryDetailLabel}>Order #:</Text>
                  <Text style={styles.inventoryDetailValue}>{item.manufacturerOrderNumber}</Text>
                </View>
                
                <View style={styles.inventoryDetail}>
                  <Text style={styles.inventoryDetailLabel}>Quantity:</Text>
                  <Text style={styles.inventoryDetailValue}>{item.quantity}</Text>
                </View>
                
                {item.notes && (
                  <View style={styles.inventoryNotes}>
                    <Text style={styles.inventoryNotesLabel}>Notes:</Text>
                    <Text style={styles.inventoryNotesText}>{item.notes}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.inventoryCardActions}>
                <TouchableOpacity 
                  style={styles.inventoryCardAction}
                  onPress={() => handleEditItem(item)}
                >
                  <Text style={styles.inventoryCardActionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.inventoryCardAction, styles.deleteAction]}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Trash2 size={14} color={Colors.danger} />
                  <Text style={[styles.inventoryCardActionText, styles.deleteActionText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <AddInventoryModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        editItem={editItem}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: Colors.text,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  activeFilterChipText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  inventoryList: {
    flex: 1,
  },
  inventoryListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  inventoryCard: {
    marginBottom: 12,
  },
  inventoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inventoryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inventoryType: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 4,
  },
  inventoryDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  inventoryCardBody: {
    marginBottom: 12,
  },
  inventoryDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  inventoryDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    width: 60,
  },
  inventoryDetailValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  inventoryNotes: {
    marginTop: 8,
  },
  inventoryNotesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  inventoryNotesText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  inventoryCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  inventoryCardAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  inventoryCardActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  deleteAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteActionText: {
    color: Colors.danger,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 120,
  },
});