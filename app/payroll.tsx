import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Users
} from 'lucide-react-native';

// Mock data for crews and employees
const mockCrews = [
  {
    id: 'crew1',
    name: 'Alpha Team',
    members: [
      { id: 'emp1', name: 'John Smith' },
      { id: 'emp2', name: 'Mike Johnson' },
      { id: 'emp3', name: 'Sarah Williams' },
    ],
  },
  {
    id: 'crew2',
    name: 'Beta Team',
    members: [
      { id: 'emp4', name: 'David Brown' },
      { id: 'emp5', name: 'Lisa Chen' },
    ],
  },
];

// Mock data for projects
const mockProjects = [
  { id: 'p1', name: 'Riverside Apartments', number: 'PRJ-2023-001' },
  { id: 'p2', name: 'Highland Office Complex', number: 'PRJ-2023-002' },
  { id: 'p3', name: 'Oakwood Residential', number: 'PRJ-2023-003' },
];

// Generate days of the week
const getDaysOfWeek = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Start with Sunday of the current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  
  return days.map((day, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return {
      day,
      date: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
    };
  });
};

// Define types for payroll data
interface PayrollEntry {
  id: string;
  projectId: string;
  projectName: string;
  projectNumber: string;
  amounts: string[];
}

interface EmployeePayroll {
  employeeId: string;
  employeeName: string;
  entries: PayrollEntry[];
}

export default function PayrollScreen() {
  const [selectedCrew, setSelectedCrew] = useState(mockCrews[0]);
  const [payrollData, setPayrollData] = useState<EmployeePayroll[]>(() => {
    // Initialize payroll data for each employee in the selected crew
    return selectedCrew.members.map(member => ({
      employeeId: member.id,
      employeeName: member.name,
      entries: [] as PayrollEntry[],
    }));
  });
  const [currentWeek, setCurrentWeek] = useState(getDaysOfWeek());

  const handleAddEntry = (employeeIndex: number) => {
    const newPayrollData = [...payrollData];
    newPayrollData[employeeIndex].entries.push({
      id: Date.now().toString(),
      projectId: '',
      projectName: '',
      projectNumber: '',
      amounts: currentWeek.map(() => ''),
    });
    setPayrollData(newPayrollData);
  };

  const handleRemoveEntry = (employeeIndex: number, entryIndex: number) => {
    const newPayrollData = [...payrollData];
    newPayrollData[employeeIndex].entries.splice(entryIndex, 1);
    setPayrollData(newPayrollData);
  };

  const handleProjectSelect = (employeeIndex: number, entryIndex: number, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const newPayrollData = [...payrollData];
    newPayrollData[employeeIndex].entries[entryIndex].projectId = projectId;
    newPayrollData[employeeIndex].entries[entryIndex].projectName = project.name;
    newPayrollData[employeeIndex].entries[entryIndex].projectNumber = project.number;
    setPayrollData(newPayrollData);
  };

  const handleAmountChange = (
    employeeIndex: number, 
    entryIndex: number, 
    dayIndex: number, 
    value: string
  ) => {
    // Only allow numbers and decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    
    const newPayrollData = [...payrollData];
    newPayrollData[employeeIndex].entries[entryIndex].amounts[dayIndex] = value;
    setPayrollData(newPayrollData);
  };

  const calculateDailyTotal = (employeeIndex: number, dayIndex: number): number => {
    return payrollData[employeeIndex].entries.reduce((sum: number, entry) => {
      const amount = parseFloat(entry.amounts[dayIndex]) || 0;
      return sum + amount;
    }, 0);
  };

  const calculateWeeklyTotal = (employeeIndex: number): number => {
    return currentWeek.reduce((sum: number, _, dayIndex) => {
      return sum + calculateDailyTotal(employeeIndex, dayIndex);
    }, 0);
  };

  const calculateCrewTotal = (): number => {
    return payrollData.reduce((sum: number, employee, employeeIndex) => {
      return sum + calculateWeeklyTotal(employeeIndex);
    }, 0);
  };

  const handlePreviousWeek = () => {
    // Logic to go to previous week
    Alert.alert('Previous Week', 'This would load the previous week data');
  };

  const handleNextWeek = () => {
    // Logic to go to next week
    Alert.alert('Next Week', 'This would load the next week data');
  };

  const handleExportPayroll = () => {
    Alert.alert('Export Payroll', 'This would export the payroll data to CSV or PDF');
  };

  const handleChangeCrew = (crewId: string) => {
    const crew = mockCrews.find(c => c.id === crewId);
    if (!crew) return;
    
    setSelectedCrew(crew);
    // Reset payroll data for new crew
    setPayrollData(crew.members.map(member => ({
      employeeId: member.id,
      employeeName: member.name,
      entries: [] as PayrollEntry[],
    })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Payroll Calculator',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={handleExportPayroll}
            >
              <Download size={18} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.weekSelector}>
        <TouchableOpacity 
          style={styles.weekButton}
          onPress={handlePreviousWeek}
        >
          <ChevronLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.weekText}>
          Week of {currentWeek[0].date} - {currentWeek[6].date}
        </Text>
        
        <TouchableOpacity 
          style={styles.weekButton}
          onPress={handleNextWeek}
        >
          <ChevronRight size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.crewSelector}>
        <Users size={18} color={Colors.textLight} />
        <Text style={styles.crewLabel}>Crew:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.crewButtonsContainer}
        >
          {mockCrews.map(crew => (
            <TouchableOpacity
              key={crew.id}
              style={[
                styles.crewButton,
                selectedCrew.id === crew.id && styles.selectedCrewButton
              ]}
              onPress={() => handleChangeCrew(crew.id)}
            >
              <Text
                style={[
                  styles.crewButtonText,
                  selectedCrew.id === crew.id && styles.selectedCrewButtonText
                ]}
              >
                {crew.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {payrollData.map((employee, employeeIndex) => (
          <Card key={employee.employeeId} style={styles.employeeCard}>
            <Text style={styles.employeeName}>{employee.employeeName}</Text>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <View style={styles.projectCell}>
                  <Text style={styles.headerText}>Project</Text>
                </View>
                {currentWeek.map((day, index) => (
                  <View key={index} style={styles.dayCell}>
                    <Text style={styles.headerText}>{day.day}</Text>
                    <Text style={styles.subHeaderText}>{day.date}</Text>
                  </View>
                ))}
                <View style={styles.totalCell}>
                  <Text style={styles.headerText}>Total</Text>
                </View>
              </View>
              
              {employee.entries.map((entry, entryIndex) => (
                <View key={entry.id} style={styles.tableRow}>
                  <View style={styles.projectCell}>
                    <TouchableOpacity 
                      style={styles.projectSelector}
                      onPress={() => {
                        // In a real app, show a project picker
                        handleProjectSelect(employeeIndex, entryIndex, 'p1');
                      }}
                    >
                      <Text style={styles.projectText} numberOfLines={1}>
                        {entry.projectName || 'Select Project'}
                      </Text>
                      {entry.projectNumber && (
                        <Text style={styles.projectNumber}>{entry.projectNumber}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveEntry(employeeIndex, entryIndex)}
                    >
                      <Trash2 size={14} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                  
                  {currentWeek.map((_, dayIndex) => (
                    <View key={dayIndex} style={styles.dayCell}>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={entry.amounts[dayIndex]}
                          onChangeText={(value) => handleAmountChange(employeeIndex, entryIndex, dayIndex, value)}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor={Colors.textLight}
                        />
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.totalCell}>
                    <Text style={styles.rowTotal}>
                      ${entry.amounts.reduce((sum: number, amount: string) => sum + (parseFloat(amount) || 0), 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.addEntryButton}
                onPress={() => handleAddEntry(employeeIndex)}
              >
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.addEntryText}>Add Job</Text>
              </TouchableOpacity>
              
              <View style={styles.tableSummary}>
                <View style={styles.projectCell}>
                  <Text style={styles.summaryText}>Daily Total</Text>
                </View>
                {currentWeek.map((_, dayIndex) => (
                  <View key={dayIndex} style={styles.dayCell}>
                    <Text style={styles.dailyTotal}>
                      ${calculateDailyTotal(employeeIndex, dayIndex).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalCell}>
                  <Text style={styles.weeklyTotal}>
                    ${calculateWeeklyTotal(employeeIndex).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
        
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Crew Weekly Summary</Text>
            <Text style={styles.summaryTotal}>${calculateCrewTotal().toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryContent}>
            {payrollData.map((employee, index) => (
              <View key={employee.employeeId} style={styles.summaryRow}>
                <Text style={styles.summaryEmployeeName}>{employee.employeeName}</Text>
                <Text style={styles.summaryEmployeeTotal}>
                  ${calculateWeeklyTotal(index).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
          
          <Button
            title="Export Payroll Data"
            leftIcon={<Download size={16} color="#FFFFFF" />}
            onPress={handleExportPayroll}
            style={styles.exportPayrollButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  exportButton: {
    padding: 8,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weekButton: {
    padding: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginHorizontal: 12,
  },
  crewSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  crewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 8,
    marginRight: 12,
  },
  crewButtonsContainer: {
    paddingRight: 16,
  },
  crewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCrewButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  crewButtonText: {
    fontSize: 12,
    color: Colors.text,
  },
  selectedCrewButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  employeeCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primary + '10',
  },
  tableContainer: {
    padding: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
  },
  projectCell: {
    flex: 2,
    paddingRight: 8,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  totalCell: {
    flex: 1.2,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  projectSelector: {
    flex: 1,
    padding: 4,
  },
  projectText: {
    fontSize: 12,
    color: Colors.text,
  },
  projectNumber: {
    fontSize: 10,
    color: Colors.textLight,
  },
  removeButton: {
    padding: 4,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    paddingHorizontal: 4,
    height: 32,
  },
  currencySymbol: {
    fontSize: 12,
    color: Colors.textLight,
  },
  amountInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'right',
    padding: 0,
    height: 32,
  },
  rowTotal: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 4,
  },
  addEntryText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
  tableSummary: {
    flexDirection: 'row',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dailyTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  weeklyTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summaryCard: {
    marginTop: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summaryContent: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryEmployeeName: {
    fontSize: 14,
    color: Colors.text,
  },
  summaryEmployeeTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  exportPayrollButton: {
    marginTop: 8,
  },
});