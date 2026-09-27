import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { EVALUATION_FORMS, EVALUATION_ROLES } from './evaluationForms';

export default function EvaluationScreen({ employee, onSaveEvaluation, currentEvaluatorRole }) {
  // الحصول على الاستمارة المناسبة للموظف بناءً على نوع وظيفته
  const activeForm = EVALUATION_FORMS[employee.formType] || EVALUATION_FORMS.administrative;
  
  // تخزين الدرجات المختارة لكل معيار (الافتراضي 0 لكل معيار)
  const [scores, setScores] = useState({});

  // تحديث درجة معيار معين (من 1 إلى 5)
  const handleScoreChange = (criterionId, scoreValue) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: scoreValue
    }));
  };

  // حساب النتيجة المئوية لهذه الاستمارة الحالية
  const calculateCurrentFormPercentage = () => {
    const totalCriteria = activeForm.criteria.length;
    const maxPossibleScore = totalCriteria * 5;
    
    const currentSum = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
    if (currentSum === 0) return 0;

    return ((currentSum / maxPossibleScore) * 100).toFixed(1);
  };

  // حفظ التقييم الحالي
  const handleSave = () => {
    const answeredCount = Object.keys(scores).length;
    if (answeredCount < activeForm.criteria.length) {
      Alert.alert("تنبيه", "يرجى تقييم جميع المعايير قبل الحفظ.");
      return;
    }

    const percentage = calculateCurrentFormPercentage();
    onSaveEvaluation({
      employeeId: employee.id,
      role: currentEvaluatorRole,
      scores: scores,
      percentage: parseFloat(percentage),
      date: new Date().toISOString()
    });

    Alert.alert("نجاح", "تم حفظ التقييم بنجاح!");
  };

  return (
    <ScrollView style={styles.container}>
      {/* رأس شاشة التقييم وبيانات الموظف */}
      <View style={styles.headerCard}>
        <Text style={styles.employeeName}>{employee.name}</Text>
        <Text style={styles.employeeMeta}>{employee.jobTitle} - {employee.jobGrade}</Text>
        <Text style={styles.employeeMeta}>{employee.department} | {employee.administration}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeForm.title}</Text>
        </View>
      </View>

      {/* معايير التقييم */}
      <Text style={styles.sectionTitle}>معايير التقييم (اختر من 1 إلى 5):</Text>
      {activeForm.criteria.map((criterion, index) => (
        <View key={criterion.id} style={styles.criterionCard}>
          <Text style={styles.criterionTitle}>{index + 1}. {criterion.title}</Text>
          <Text style={styles.criterionDesc}>{criterion.description}</Text>

          {/* أزرار تقييم الدرجات من 1 إلى 5 */}
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = scores[criterion.id] === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.scoreButton, isSelected && styles.scoreButtonActive]}
                  onPress={() => handleScoreChange(criterion.id, val)}
                >
                  <Text style={[styles.scoreText, isSelected && styles.scoreTextActive]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* نتيجة الاستمارة الحالية وحفظ */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>درجة الاستمارة الحالية:</Text>
        <Text style={styles.percentageText}>{calculateCurrentFormPercentage()}%</Text>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>حفظ التقييم</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 15 },
  headerCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 15 },
  employeeName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  employeeMeta: { color: '#94a3b8', fontSize: 14, textAlign: 'right', marginTop: 4 },
  badge: { backgroundColor: '#334155', padding: 6, borderRadius: 6, marginTop: 10, alignSelf: 'flex-start' },
  badgeText: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10, textAlign: 'right' },
  criterionCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: 10, marginBottom: 12 },
  criterionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', textAlign: 'right' },
  criterionDesc: { fontSize: 12, color: '#64748b', textAlign: 'right', marginVertical: 6 },
  scoreRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 8 },
  scoreButton: { width: 45, height: 45, borderRadius: 23, borderWidth: 1, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  scoreButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#475569' },
  scoreTextActive: { color: '#ffffff' },
  summaryCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 15, marginBottom: 40 },
  summaryText: { fontSize: 16, color: '#475569', fontWeight: 'bold' },
  percentageText: { fontSize: 32, fontWeight: 'bold', color: '#16a34a', marginVertical: 8 },
  saveButton: { backgroundColor: '#2563eb', width: '100%', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
