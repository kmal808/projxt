import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Colors from '@/constants/colors';
import { 
  File,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Download,
  Upload,
  Trash2,
  Plus,
  ChevronRight
} from 'lucide-react-native';

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  createdAt: string;
};

const MOCK_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    type: 'application/pdf',
    size: 2500000,
    uri: 'https://example.com/files/proposal.pdf',
    createdAt: '2025-05-29T10:00:00Z'
  },
  {
    id: '2',
    name: 'Site Photos',
    type: 'folder',
    size: 0,
    uri: '',
    createdAt: '2025-05-28T15:30:00Z'
  },
  {
    id: '3',
    name: 'Invoice Template.xlsx',
    type: 'application/xlsx',
    size: 150000,
    uri: 'https://example.com/files/invoice.xlsx',
    createdAt: '2025-05-27T09:15:00Z'
  }
];

export default function FilesScreen() {
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles = result.assets.map(asset => ({
          id: Math.random().toString(),
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
          uri: asset.uri,
          createdAt: new Date().toISOString()
        }));

        setFiles(prev => [...newFiles, ...prev]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const shareFile = async (file: FileItem) => {
    if (Platform.OS === 'web') {
      // Web handling
      window.open(file.uri, '_blank');
      return;
    }

    try {
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(file.uri);
      }
    } catch (err) {
      console.error('Error sharing file:', err);
    }
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const renderFileIcon = (type: string) => {
    if (type === 'folder') {
      return <FolderOpen size={24} color={Colors.primary} />;
    }
    if (type.startsWith('image/')) {
      return <ImageIcon size={24} color={Colors.accent} />;
    }
    return <FileText size={24} color={Colors.secondary} />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderFileItem = (file: FileItem) => (
    <Card key={file.id} style={styles.fileCard}>
      <TouchableOpacity 
        style={styles.fileContent}
        onPress={() => file.type === 'folder' ? setCurrentPath(prev => [...prev, file.name]) : shareFile(file)}
      >
        <View style={styles.fileIconContainer}>
          {renderFileIcon(file.type)}
        </View>
        
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
          <Text style={styles.fileInfo}>
            {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
          </Text>
        </View>

        <View style={styles.fileActions}>
          {file.type !== 'folder' && (
            <TouchableOpacity 
              onPress={() => shareFile(file)}
              style={styles.actionButton}
            >
              <Download size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => deleteFile(file.id)}
            style={styles.actionButton}
          >
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
          <ChevronRight size={20} color={Colors.textLight} />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Files</Text>
        <Button
          title="Upload"
          onPress={pickDocument}
          variant="primary"
          leftIcon={<Upload size={20} color="#FFF" />}
          style={styles.uploadButton}
        />
      </View>

      {currentPath.length > 0 && (
        <View style={styles.breadcrumbs}>
          <TouchableOpacity 
            onPress={() => setCurrentPath([])}
            style={styles.breadcrumbItem}
          >
            <Text style={styles.breadcrumbText}>Files</Text>
          </TouchableOpacity>
          {currentPath.map((path, index) => (
            <React.Fragment key={path}>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <TouchableOpacity 
                onPress={() => setCurrentPath(prev => prev.slice(0, index + 1))}
                style={styles.breadcrumbItem}
              >
                <Text style={styles.breadcrumbText}>{path}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {files.length === 0 ? (
          <EmptyState
            icon={<File size={48} color={Colors.textLight} />}
            title="No files yet"
            description="Upload files or create folders to get started"
            actionLabel="Upload Files"
            onAction={pickDocument}
          />
        ) : (
          files.map(renderFileItem)
        )}
      </ScrollView>
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
  uploadButton: {
    paddingHorizontal: 16,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    color: Colors.primary,
    fontSize: 14,
  },
  breadcrumbSeparator: {
    color: Colors.textLight,
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  fileCard: {
    marginBottom: 12,
    padding: 12,
  },
  fileContent: {
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
  fileDetails: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 12,
    color: Colors.textLight,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 4,
  },
});