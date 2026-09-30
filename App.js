import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { EMPLOYEES } from './employeesData';
import { EVALUATION_ROLES } from './evaluationForms';
import EvaluationScreen from './EvaluationScreen';

export default function App() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentRole, setCurrentRole] = useState('self');
  const [evaluationsRecord, setEvaluationsRecord] = useState({});

  const handleSaveEvaluation = (evalData) => {
    setEvaluationsRecord(prev => {
      const empEvals = prev[evalData.employeeId] || {};
      return {
        ...prev,
        [evalData.employeeId]: {
          ...empEvals,
          [evalData.role]: evalData.percentage
        }
      };
    });
    setSelectedEmployee(null);
  };

  const calculateOverallAverage = (employeeId) => {
    const empEvals = evaluationsRecord[employeeId];
    if (!empEvals) return null;

    const scores = Object.values(empEvals);
    if (scores.length === 0) return null;

    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return (sum / scores.length).toFixed(1);
  };

  if (selectedEmployee) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setSelectedEmployee(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← العودة للقائمة</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>إجراء تقييم أداء</Text>
        </View>

        <View style={styles.roleSelectorContainer}>
          <Text style={styles.roleSelectorLabel}>اختر صفة المُقَيِّم الآن:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
            {EVALUATION_ROLES.map(role => (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleChip, currentRole === role.id && styles.roleChipActive]}
                onPress={() => setCurrentRole(role.id)}
              >
                <Text style={[styles.roleChipText, currentRole === role.id && styles.roleChipTextActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <EvaluationScreen
          employee={selectedEmployee}
          currentEvaluatorRole={currentRole}
          onSaveEvaluation={handleSaveEvaluation}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      <View style={styles.header}>
        <Text style={styles.appTitle}>نظام تقييمات الأداء 360°</Text>
        <Text style={styles.appSubtitle}>سجل الموظفين ومتابعة متوسط التقييم السنوي</Text>
      </View>

      <FlatList
        data={EMPLOYEES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const overallAvg = calculateOverallAverage(item.id);
          const empRecord = evaluationsRecord[item.id] || {};
          const completedRolesCount = Object.keys(empRecord).length;

          return (
            <View style={styles.employeeCard}>
              <View style={styles.empInfo}>
                <Text style={styles.empName}>{item.name}</Text>
                <Text style={styles.empDetails}>رقم الموظف: {item.id} | {item.jobTitle}</Text>
                <Text style={styles.empSubDetails}>{item.department} - {item.administration}</Text>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.badgeBox}>
                  <Text style={styles.badgeLabel}>التقييمات المكتملة:</Text>
                  <Text style={styles.badgeVal}>{completedRolesCount} من 4</Text>
                </View>

                {overallAvg !== null ? (
                  <View style={styles.avgBox}>
                    <Text style={styles.avgLabel}>المتوسط العام</Text>
                    <Text style={styles.avgValue}>{overallAvg}%</Text>
                  </View>
                ) : (
                  <View style={[styles.avgBox, { backgroundColor: '#f1f5f9' }]}>
                    <Text style={[styles.avgLabel, { color: '#64748b' }]}>لم يُقيَّم بعد</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.evalButton}
                onPress={() => setSelectedEmployee(item)}
              >
                <Text style={styles.evalButtonText}>بدء / استكمال التقييم</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { backgroundColor: '#1e293b', padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  appSubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
  listContainer: { padding: 15 },
  employeeCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  empInfo: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10, marginBottom: 10 },
  empName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textAlign: 'right' },
  empDetails: { fontSize: 13, color: '#475569', textAlign: 'right', marginTop: 3 },
  empSubDetails: { fontSize: 12, color: '#94a3b8', textAlign: 'right', marginTop: 2 },
  statusRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  badgeBox: { alignItems: 'flex-start' },
  badgeLabel: { fontSize: 11, color: '#64748b' },
  badgeVal: { fontSize: 13, fontWeight: 'bold', color: '#2563eb', marginTop: 2 },
  avgBox: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  avgLabel: { fontSize: 11, color: '#166534', fontWeight: 'bold' },
  avgValue: { fontSize: 18, fontWeight: 'bold', color: '#15803d' },
  evalButton: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  evalButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  topBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#1e293b' },
  topBarTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  backButton: { padding: 5 },
  backButtonText: { color: '#38bdf8', fontSize: 14, fontWeight: 'bold' },
  roleSelectorContainer: { backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  roleSelectorLabel: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8, textAlign: 'right' },
  roleScroll: { flexDirection: 'row-reverse' },
  roleChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginLeft: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  roleChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleChipText: { fontSize: 12, color: '#475569', fontWeight: 'bold' },
  roleChipTextActive: { color: '#ffffff' }
});
