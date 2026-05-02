import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GRADES, ScalePrompt, SCALE_PROMPTS } from './src/data/scales';

type PracticePrompt = ScalePrompt & {
  selectedBowing: string;
};

function pickRandomScale(
  scales: ScalePrompt[],
  previousScaleId?: string,
): ScalePrompt {
  if (scales.length === 1) {
    return scales[0];
  }

  const availableScales = scales.filter((scale) => scale.id !== previousScaleId);
  const scalePool = availableScales.length > 0 ? availableScales : scales;
  const randomIndex = Math.floor(Math.random() * scalePool.length);

  return scalePool[randomIndex];
}

function pickRandomOption(options: string[]): string {
  const randomIndex = Math.floor(Math.random() * options.length);

  return options[randomIndex];
}

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
  const [currentScale, setCurrentScale] = useState<PracticePrompt | null>(null);
  const [history, setHistory] = useState<PracticePrompt[]>([]);

  const gradeScales = useMemo(
    () => SCALE_PROMPTS.filter((scale) => scale.grade === selectedGrade),
    [selectedGrade],
  );

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    setCurrentScale(null);
    setHistory([]);
  };

  const handleSpin = () => {
    const nextScale = pickRandomScale(gradeScales, currentScale?.id);
    const nextPrompt = {
      ...nextScale,
      selectedBowing: pickRandomOption(nextScale.bowingOptions),
    };

    setCurrentScale(nextPrompt);
    setHistory((previousHistory) => [nextPrompt, ...previousHistory].slice(0, 5));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>ScaleRoulette</Text>
          <Text style={styles.subtitle}>Violin exam scale practice</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Grade</Text>
          <View style={styles.gradeGrid}>
            {GRADES.map((grade) => {
              const isSelected = selectedGrade === grade;

              return (
                <Pressable
                  key={grade}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleGradeChange(grade)}
                  style={[styles.gradeButton, isSelected && styles.gradeButtonActive]}
                >
                  <Text
                    style={[
                      styles.gradeButtonText,
                      isSelected && styles.gradeButtonTextActive,
                    ]}
                  >
                    {grade}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.resultPanel}>
          {currentScale ? (
            <>
              <Text style={styles.resultEyebrow}>Practise next</Text>
              <Text style={styles.resultTitle}>{currentScale.name}</Text>
              <Text style={styles.resultMeta}>{currentScale.pattern}</Text>
              <Text style={styles.resultDetail}>{currentScale.selectedBowing}</Text>
            </>
          ) : (
            <>
              <Text style={styles.resultEyebrow}>Ready</Text>
              <Text style={styles.resultTitle}>Spin for Grade {selectedGrade}</Text>
              <Text style={styles.resultMeta}>
                {gradeScales.length} syllabus prompts loaded
              </Text>
            </>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSpin}
          style={({ pressed }) => [
            styles.spinButton,
            pressed && styles.spinButtonPressed,
          ]}
        >
          <Text style={styles.spinButtonText}>Spin</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.label}>Recent spins</Text>
          {history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((scale, index) => (
                <View key={`${scale.id}-${index}`} style={styles.historyItem}>
                  <Text style={styles.historyName}>{scale.name}</Text>
                  <Text style={styles.historyMeta}>{scale.pattern}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyHistory}>No spins yet.</Text>
          )}
        </View>

        <Text style={styles.dataNote}>
          Data extracted from the ABRSM Bowed Strings Practical Grades syllabus
          from 2024. Please cross-check before relying on it in an exam setting.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f3ed',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 24,
  },
  header: {
    paddingTop: 12,
  },
  appName: {
    color: '#231f20',
    fontSize: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: '#675f58',
    fontSize: 17,
    marginTop: 6,
  },
  section: {
    gap: 12,
  },
  label: {
    color: '#463f3a',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gradeButton: {
    alignItems: 'center',
    backgroundColor: '#fffaf4',
    borderColor: '#d9cdc0',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  gradeButtonActive: {
    backgroundColor: '#1f6f6b',
    borderColor: '#1f6f6b',
  },
  gradeButtonText: {
    color: '#463f3a',
    fontSize: 17,
    fontWeight: '700',
  },
  gradeButtonTextActive: {
    color: '#ffffff',
  },
  resultPanel: {
    backgroundColor: '#fffaf4',
    borderColor: '#d9cdc0',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 220,
    justifyContent: 'center',
    padding: 24,
  },
  resultEyebrow: {
    color: '#b3472f',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  resultTitle: {
    color: '#231f20',
    fontSize: 34,
    fontWeight: '800',
  },
  resultMeta: {
    color: '#463f3a',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 14,
  },
  resultDetail: {
    color: '#675f58',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  spinButton: {
    alignItems: 'center',
    backgroundColor: '#b3472f',
    borderRadius: 8,
    minHeight: 58,
    justifyContent: 'center',
  },
  spinButtonPressed: {
    opacity: 0.82,
  },
  spinButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: '#fffaf4',
    borderColor: '#e3d8ca',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  historyName: {
    color: '#231f20',
    fontSize: 16,
    fontWeight: '700',
  },
  historyMeta: {
    color: '#675f58',
    fontSize: 14,
    marginTop: 4,
  },
  emptyHistory: {
    color: '#675f58',
    fontSize: 15,
  },
  dataNote: {
    color: '#7b7168',
    fontSize: 13,
    lineHeight: 19,
  },
});
