import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Download,
  ChevronRight
} from 'lucide-react-native';

export default function ReportsScreen() {
  const renderReportCard = (
    icon: React.ReactNode,
    title: string,
    description: string,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card style={styles.reportCard}>
          <View style={styles.reportIconContainer}>
            {icon}
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>{title}</Text>
            <Text style={styles.reportDescription}>{description}</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Reports</Text>
          
          {renderReportCard(
            <BarChart3 size={24} color={Colors.primary} />,
            'Budget Analysis',
            'Compare budgeted vs actual costs across projects',
            () => {}
          )}
          
          {renderReportCard(
            <TrendingUp size={24} color={Colors.success} />,
            'Profit & Loss',
            'View revenue, expenses, and profit margins',
            () => {}
          )}
          
          {renderReportCard(
            <PieChart size={24} color={Colors.accent} />,
            'Expense Breakdown',
            'Analyze expenses by category and project',
            () => {}
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Reports</Text>
          
          {renderReportCard(
            <Calendar size={24} color={Colors.primary} />,
            'Project Timeline',
            'Track project progress and milestone completion',
            () => {}
          )}
          
          {renderReportCard(
            <FileText size={24} color={Colors.secondary} />,
            'Project Status',
            'Comprehensive overview of all active projects',
            () => {}
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payroll Reports</Text>
          
          {renderReportCard(
            <Download size={24} color={Colors.primary} />,
            'Payroll Summary',
            'Export payroll data for accounting and taxes',
            () => {}
          )}
        </View>
        
        <View style={styles.customReportSection}>
          <Text style={styles.customReportTitle}>Need a Custom Report?</Text>
          <Text style={styles.customReportDescription}>
            Create tailored reports to meet your specific business needs
          </Text>
          <TouchableOpacity style={styles.customReportButton}>
            <Text style={styles.customReportButtonText}>Create Custom Report</Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  customReportSection: {
    marginTop: 32,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    alignItems: 'center',
  },
  customReportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  customReportDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  customReportButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  customReportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});