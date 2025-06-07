import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { FileItem } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Colors from '@/constants/colors';
import { 
  File, 
  Image as ImageIcon, 
  FileText, 
  FilePlus, 
  Download, 
  Trash2, 
  Share2,
  FolderOpen,
  Search,
  Filter
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Input from '@/components/ui/Input';

// Mock data for files
const mockFiles: FileItem[] = [
  {
    id: 'file1',
    name: 'Site Plan.pdf',
    type: 'pdf',
    size: 2500000,
    uri: 'https://example.com/sitePlan.pdf',
    createdAt: '2023-08-15T10:30:00Z',
    updatedAt: '2023-08-15T10:30:00Z',
    category: 'Plans',
    tags: ['site', 'blueprint'],
    owner: 'Project Manager',
  },
  {
    id: 'file2',
    name: 'Progress Photo 1.jpg',
    type: 'jpg',
    size: 1800000,
    uri: 'https://example.com/progressPhoto1.jpg',
    createdAt: '2023-08-20T14:45:00Z',
    updatedAt: '2023-08-20T14:45:00Z',
    category: 'Photos',
    tags: ['progress', 'foundation'],
    owner: 'Site Supervisor',
  },
  {
    id: 'file3',
    name: 'Material Invoice.pdf',
    type: 'pdf',
    size: 500000,
    uri: 'https://example.com/invoice.pdf',
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2023-08-22T09:15:00Z',
    category: 'Invoices',
    tags: ['financial', 'materials'],
    owner: 'Accounting',
  },
  {
    id: 'file4',
    name: 'Safety Checklist.docx',
    type: 'docx',
    size: 350000,
    uri: 'https://example.com/safetyChecklist.docx',
    createdAt: '2023-08-25T11:20:00Z',
    updatedAt: '2023-08-25T11:20:00Z',
    category: 'Safety',
    tags: ['checklist', 'compliance'],
    owner: 'Safety Officer',
  },
  {
    id: 'file5',
    name: 'Electrical Diagram.dwg',
    type: 'dwg',
    size: 3200000,
    uri: 'https://example.com/electricalDiagram.dwg',
    createdAt: '2023-08-28T16:10:00Z',
    updatedAt: '2023-08-28T16:10:00Z',
    category: 'Plans',
    tags: ['electrical', 'engineering'],
    owner: 'Electrical Engineer',
  },
];

export default function FilesScreen() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  
  // Get unique categories from files
  const categories = Array.from(new Set(files.map(file => file.category)));
  
  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFiles(mockFiles);
      } catch (error) {
        console.error('Error loading files:', error);
        Alert.alert('Error', 'Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    // Filter files based on search query and selected category
    let filtered = files;
    
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(file => file.category === selectedCategory);
    }
    
    setFilteredFiles(filtered);
  }, [files, searchQuery, selectedCategory]);
  
  const handleAddFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      
      // Create new file object
      const newFile: FileItem = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size,
        uri: file.uri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'Uncategorized',
        owner: 'Current User',
      };
      
      // Add file to list
      setFiles(prev => [newFile, ...prev]);
      
      Alert.alert('Success', 'File uploaded successfully');
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file');
    }
  };
  
  const handleDeleteFile = (fileId: string) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFiles(prev => prev.filter(file => file.id !== fileId));
          },
        },
      ]
    );
  };
  
  const handleShareFile = async (file: FileItem) => {
    try {
      // In a real app, you would download the file first if it's a remote URL
      // For this demo, we'll just simulate sharing
      
      if (Platform.OS === 'web') {
        Alert.alert('Share', `Sharing "${file.name}" is not available on web`);
        return;
      }
      
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }
      
      // For demo purposes, we'll use a local file
      // In a real app, you would use the actual file URI
      await Sharing.shareAsync(file.uri);
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };
  
  const handleDownloadFile = async (file: FileItem) => {
    try {
      // In a real app, you would download the file to the device
      // For this demo, we'll just simulate downloading
      
      Alert.alert('Download', `Downloading "${file.name}"...`);
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Success', `"${file.name}" downloaded successfully`);
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };
  
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon size={24} color={Colors.primary} />;
      case 'pdf':
        return <FileText size={24} color={Colors.danger} />;
      case 'doc':
      case 'docx':
        return <FileText size={24} color={Colors.primary} />;
      case 'xls':
      case 'xlsx':
        return <FileText size={24} color={Colors.success} />;
      case 'dwg':
        return <FileText size={24} color={Colors.warning} />;
      default:
        return <File size={24} color={Colors.textLight} />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const renderFileItem = ({ item }: { item: FileItem }) => {
    return (
      <Card style={styles.fileCard}>
        <View style={styles.fileCardContent}>
          <View style={styles.fileIconContainer}>
            {getFileIcon(item.type)}
          </View>
          
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{item.name}</Text>
            <Text style={styles.fileDetails}>
              {formatFileSize(item.size)} • {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
            <View style={styles.fileTags}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
              {item.tags?.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.fileActions}>
            <TouchableOpacity 
              style={styles.fileAction}
              onPress={() => handleDownloadFile(item)}
            >
              <Download size={18} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fileAction}
              onPress={() => handleShareFile(item)}
            >
              <Share2 size={18} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fileAction}
              onPress={() => handleDeleteFile(item.id)}
            >
              <Trash2 size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };
  
  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading files..." />;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Files',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleAddFile}
            >
              <FilePlus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search files by name or tag"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={18} color={Colors.textLight} />}
          style={styles.searchInput}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === null && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === null && styles.selectedCategoryButtonText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryButtonText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {filteredFiles.length > 0 ? (
        <FlatList
          data={filteredFiles}
          renderItem={renderFileItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filesList}
        />
      ) : (
        <EmptyState
          icon={<FolderOpen size={48} color={Colors.textLight} />}
          title="No files found"
          message={
            searchQuery || selectedCategory
              ? "No files match your search criteria. Try adjusting your filters."
              : "You haven't uploaded any files yet. Tap the + button to add your first file."
          }
          actionButton={
            !searchQuery && !selectedCategory ? (
              <Button
                title="Upload File"
                onPress={handleAddFile}
                leftIcon={<FilePlus size={18} color="#FFFFFF" />}
              />
            ) : (
              <Button
                title="Clear Filters"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                leftIcon={<Filter size={18} color="#FFFFFF" />}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedCategoryButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  filesList: {
    padding: 16,
  },
  fileCard: {
    marginBottom: 8,
    padding: 12,
  },
  fileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  fileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
  },
  categoryTagText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textLight,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});

// Add ScrollView import
import { ScrollView } from 'react-native';