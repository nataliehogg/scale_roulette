import { StatusBar } from 'expo-status-bar';
import {
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  useFonts,
} from '@expo-google-fonts/eb-garamond';
import {
  ComicNeue_400Regular,
  ComicNeue_700Bold,
} from '@expo-google-fonts/comic-neue';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { GRADES, ScalePrompt, SCALE_PROMPTS } from './src/data/scales';

type PracticePrompt = ScalePrompt & {
  selectedBowing: string;
};

type ThemeName = 'classic' | 'bright' | 'contrast';

type AppTheme = {
  name: ThemeName;
  label: string;
  fontFamily: 'serif' | 'sans' | 'comic';
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  labelText: string;
  primary: string;
  primaryText: string;
  accent: string;
  selected: string;
  selectedText: string;
  wheelStroke: string;
  wheelHub: string;
  wheelDot: string;
  wheelSegments: string[];
};

const THEMES: AppTheme[] = [
  {
    name: 'classic',
    label: 'Classic',
    fontFamily: 'serif',
    background: '#ead8bc',
    surface: '#f7ecd8',
    border: '#a8763e',
    text: '#2a170f',
    mutedText: '#6a4930',
    labelText: '#4b2b1d',
    primary: '#7f2e2f',
    primaryText: '#ffffff',
    accent: '#7f2e2f',
    selected: '#244634',
    selectedText: '#ffffff',
    wheelStroke: '#3a2418',
    wheelHub: '#f7ecd8',
    wheelDot: '#c9974d',
    wheelSegments: [
      '#7f2e2f',
      '#f3dfb8',
      '#284f3d',
      '#c9974d',
      '#5a3322',
      '#efe0c4',
      '#9d5b3d',
      '#d7b66c',
      '#244634',
      '#f7ecd8',
      '#7f2e2f',
      '#c9974d',
    ],
  },
  {
    name: 'bright',
    label: 'Bright',
    fontFamily: 'comic',
    background: '#F45B26',
    surface: '#ffffff',
    border: '#03AED2',
    text: '#141414',
    mutedText: '#333333',
    labelText: '#141414',
    primary: '#F8DE22',
    primaryText: '#141414',
    accent: '#D12052',
    selected: '#03AED2',
    selectedText: '#ffffff',
    wheelStroke: '#141414',
    wheelHub: '#ffffff',
    wheelDot: '#F8DE22',
    wheelSegments: [
      '#03AED2',
      '#F8DE22',
      '#F45B26',
      '#D12052',
      '#03AED2',
      '#F8DE22',
      '#F45B26',
      '#D12052',
      '#03AED2',
      '#F8DE22',
      '#F45B26',
      '#D12052',
    ],
  },
  {
    name: 'contrast',
    label: 'Contrast',
    fontFamily: 'sans',
    background: '#ffffff',
    surface: '#ffffff',
    border: '#000000',
    text: '#000000',
    mutedText: '#000000',
    labelText: '#000000',
    primary: '#000000',
    primaryText: '#ffffff',
    accent: '#000000',
    selected: '#000000',
    selectedText: '#ffffff',
    wheelStroke: '#000000',
    wheelHub: '#ffffff',
    wheelDot: '#000000',
    wheelSegments: [
      '#000000',
      '#ffffff',
      '#808080',
      '#ffffff',
      '#000000',
      '#ffffff',
      '#808080',
      '#ffffff',
      '#000000',
      '#ffffff',
      '#808080',
      '#ffffff',
    ],
  },
];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeWedge(startAngle: number, endAngle: number) {
  const start = polarToCartesian(50, 50, 43, endAngle);
  const end = polarToCartesian(50, 50, 43, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    50,
    50,
    'L',
    start.x,
    start.y,
    'A',
    43,
    43,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

function RouletteWheel({ theme = THEMES[0] }: { theme?: AppTheme }) {
  const segmentCount = theme.wheelSegments.length;
  const segmentAngle = 360 / segmentCount;

  return (
    <Svg width={112} height={112} viewBox="0 0 100 100">
      {theme.wheelSegments.map((segmentColor, index) => (
        <Path
          key={index}
          d={describeWedge(index * segmentAngle, (index + 1) * segmentAngle)}
          fill={segmentColor}
          stroke={theme.wheelStroke}
          strokeWidth={1}
        />
      ))}
      <Circle cx={50} cy={50} r={43} fill="none" stroke={theme.wheelStroke} strokeWidth={3} />
      <Circle cx={50} cy={50} r={11} fill={theme.wheelHub} stroke={theme.wheelStroke} strokeWidth={2} />
      <Circle cx={50} cy={50} r={4} fill={theme.wheelDot} />
    </Svg>
  );
}

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

function formatMusicText(value: string): string {
  return value.replace(/-sharp/g, '♯').replace(/-flat/g, '♭');
}

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
  const [currentScale, setCurrentScale] = useState<PracticePrompt | null>(null);
  const [history, setHistory] = useState<PracticePrompt[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>('classic');
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    ComicNeue_400Regular,
    ComicNeue_700Bold,
  });

  const gradeScales = useMemo(
    () => SCALE_PROMPTS.filter((scale) => scale.grade === selectedGrade),
    [selectedGrade],
  );
  const theme = THEMES.find((candidate) => candidate.name === themeName) ?? THEMES[0];

  const handleGradeChange = (grade: number) => {
    spinAnimation.stopAnimation();
    spinAnimation.setValue(0);
    setIsSpinning(false);
    setSelectedGrade(grade);
    setCurrentScale(null);
    setHistory([]);
  };

  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    setIsSpinning(true);
    spinAnimation.setValue(0);
    const nextScale = pickRandomScale(gradeScales, currentScale?.id);
    const nextPrompt = {
      ...nextScale,
      selectedBowing: pickRandomOption(nextScale.bowingOptions),
    };

    Animated.timing(spinAnimation, {
      duration: 950,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setCurrentScale(nextPrompt);
      setHistory((previousHistory) => [nextPrompt, ...previousHistory].slice(0, 5));
      setIsSpinning(false);
    });
  };

  if (!fontsLoaded) {
    return <SafeAreaView style={styles.screen} />;
  }

  const spinnerRotation = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.name === 'contrast' ? 'dark' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.appName,
              { color: theme.text },
              themedFont(theme, boldFont, '700'),
            ]}
          >
            ScaleRoulette
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.mutedText },
              themedFont(theme, regularFont, '400'),
            ]}
          >
            Violin exam scale practice
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              { color: theme.labelText },
              themedFont(theme, semiboldFont, '700'),
            ]}
          >
            Theme
          </Text>
          <View style={styles.themeRow}>
            {THEMES.map((themeOption) => {
              const isSelected = themeOption.name === themeName;

              return (
                <Pressable
                  key={themeOption.name}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setThemeName(themeOption.name)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: isSelected ? theme.selected : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: isSelected ? theme.selectedText : theme.labelText },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    {themeOption.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              { color: theme.labelText },
              themedFont(theme, semiboldFont, '700'),
            ]}
          >
            Grade
          </Text>
          <View style={styles.gradeGrid}>
            {GRADES.map((grade) => {
              const isSelected = selectedGrade === grade;

              return (
                <Pressable
                  key={grade}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleGradeChange(grade)}
                  style={[
                    styles.gradeButton,
                    {
                      backgroundColor: isSelected ? theme.selected : theme.surface,
                      borderColor: isSelected ? theme.selected : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gradeButtonText,
                      { color: isSelected ? theme.selectedText : theme.labelText },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    {grade}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.resultPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {isSpinning ? (
            <View style={styles.spinningState}>
              <Animated.View
                style={[
                  styles.spinnerWheel,
                  { transform: [{ rotate: spinnerRotation }] },
                ]}
              >
                <RouletteWheel theme={theme} />
              </Animated.View>
            </View>
          ) : currentScale ? (
            <>
              <Text
                style={[
                  styles.resultEyebrow,
                  { color: theme.accent },
                  themedFont(theme, semiboldFont, '700'),
                ]}
              >
                Practise next
              </Text>
              <Text
                style={[
                  styles.resultTitle,
                  { color: theme.text },
                  themedFont(theme, boldFont, '700'),
                ]}
              >
                {formatMusicText(currentScale.name)}
              </Text>
              <Text
                style={[
                  styles.resultMeta,
                  { color: theme.labelText },
                  themedFont(theme, bodyFont, '500'),
                ]}
              >
                {formatMusicText(currentScale.pattern)}
              </Text>
              <Text
                style={[
                  styles.resultDetail,
                  { color: theme.labelText },
                  themedFont(theme, bodyFont, '500'),
                ]}
              >
                {formatMusicText(currentScale.selectedBowing)}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.resultEyebrow,
                  { color: theme.accent },
                  themedFont(theme, semiboldFont, '700'),
                ]}
              >
                Ready
              </Text>
              <Text
                style={[
                  styles.resultTitle,
                  { color: theme.text },
                  themedFont(theme, boldFont, '700'),
                ]}
              >
                Spin for Grade {selectedGrade}
              </Text>
              <Text
                style={[
                  styles.resultMeta,
                  { color: theme.labelText },
                  themedFont(theme, bodyFont, '500'),
                ]}
              >
                {gradeScales.length} syllabus prompts loaded
              </Text>
            </>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSpin}
          disabled={isSpinning}
          style={({ pressed }) => [
            styles.spinButton,
            { backgroundColor: theme.primary },
            pressed && styles.spinButtonPressed,
            isSpinning && styles.spinButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.spinButtonText,
              { color: theme.primaryText },
              themedFont(theme, boldFont, '700'),
            ]}
          >
            {isSpinning ? 'Spinning...' : 'Spin'}
          </Text>
        </Pressable>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              { color: theme.labelText },
              themedFont(theme, semiboldFont, '700'),
            ]}
          >
            Recent spins
          </Text>
          {history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((scale, index) => (
                <View
                  key={`${scale.id}-${index}`}
                  style={[
                    styles.historyItem,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyName,
                      { color: theme.text },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    {formatMusicText(scale.name)}
                  </Text>
                  <Text
                    style={[
                      styles.historyMeta,
                      { color: theme.mutedText },
                      themedFont(theme, regularFont, '400'),
                    ]}
                  >
                    {formatMusicText(scale.pattern)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text
              style={[
                styles.emptyHistory,
                { color: theme.mutedText },
                themedFont(theme, regularFont, '400'),
              ]}
            >
              No spins yet.
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.dataNote,
            { color: theme.mutedText },
            themedFont(theme, regularFont, '400'),
          ]}
        >
          Data extracted from the ABRSM Bowed Strings Practical Grades syllabus
          from 2024. Please cross-check before relying on it in an exam setting.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const bodyFont = 'EBGaramond_500Medium';
const regularFont = 'EBGaramond_400Regular';
const semiboldFont = 'EBGaramond_600SemiBold';
const boldFont = 'EBGaramond_700Bold';
const comicRegularFont = 'ComicNeue_400Regular';
const comicBoldFont = 'ComicNeue_700Bold';

const themedFont = (
  theme: AppTheme,
  serifFont: string,
  fallbackWeight?: '400' | '500' | '600' | '700',
) => ({
  fontFamily:
    theme.fontFamily === 'serif'
      ? serifFont
      : theme.fontFamily === 'comic' && fallbackWeight === '700'
        ? comicBoldFont
        : theme.fontFamily === 'comic'
          ? comicRegularFont
          : undefined,
  fontWeight:
    theme.fontFamily === 'serif' || theme.fontFamily === 'comic'
      ? undefined
      : fallbackWeight,
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    fontSize: 42,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 6,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    textTransform: 'uppercase',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    maxWidth: 276,
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  themeButtonText: {
    fontSize: 18,
  },
  gradeButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  gradeButtonText: {
    fontSize: 24,
  },
  resultPanel: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 220,
    justifyContent: 'center',
    padding: 24,
  },
  resultEyebrow: {
    fontSize: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 34,
  },
  resultMeta: {
    fontSize: 21,
    lineHeight: 26,
    marginTop: 14,
  },
  resultDetail: {
    fontSize: 21,
    lineHeight: 26,
    marginTop: 8,
  },
  spinButton: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 58,
    justifyContent: 'center',
  },
  spinButtonPressed: {
    opacity: 0.82,
  },
  spinButtonDisabled: {
    opacity: 0.74,
  },
  spinButtonText: {
    fontSize: 24,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  historyName: {
    fontSize: 19,
  },
  historyMeta: {
    fontSize: 17,
    marginTop: 4,
  },
  emptyHistory: {
    fontSize: 18,
  },
  dataNote: {
    fontSize: 16,
    lineHeight: 19,
  },
  spinningState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWheel: {
    height: 112,
    width: 112,
  },
});
