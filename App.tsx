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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { GRADES, ScalePrompt, SCALE_PROMPTS } from './src/data/scales';

type PracticePrompt = ScalePrompt & {
  selectedBowing: string;
};

type ThemeName = 'classic' | 'bright' | 'contrast';
type DifficultyMode = 'easy' | 'normal' | 'hard';
type ScaleCategory =
  | 'scales'
  | 'arpeggios'
  | 'chromatic'
  | 'dominantSevenths'
  | 'diminishedSevenths'
  | 'doubleStops';

type CategorySelection = Record<ScaleCategory, boolean>;
type PersistedSettings = {
  avoidRecentRepeats: boolean;
  difficultyMode: DifficultyMode;
  easyScaleIds: string[];
  enabledCategories: CategorySelection;
  hardScaleIds: string[];
  selectedGrade: number;
  themeName: ThemeName;
};

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

const CATEGORIES: { key: ScaleCategory; label: string }[] = [
  { key: 'scales', label: 'Scales' },
  { key: 'arpeggios', label: 'Arpeggios' },
  { key: 'chromatic', label: 'Chromatic' },
  { key: 'dominantSevenths', label: 'Dominant sevenths' },
  { key: 'diminishedSevenths', label: 'Diminished sevenths' },
  { key: 'doubleStops', label: 'Double-stops' },
];

const DEFAULT_CATEGORIES: CategorySelection = {
  scales: true,
  arpeggios: true,
  chromatic: true,
  dominantSevenths: true,
  diminishedSevenths: true,
  doubleStops: true,
};

const DIFFICULTY_MODES: { key: DifficultyMode; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'normal', label: 'Normal' },
  { key: 'hard', label: 'Hard' },
];

const SETTINGS_STORAGE_KEY = 'scale-roulette:settings:v1';

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
  excludedScaleIds: string[] = [],
): ScalePrompt {
  if (scales.length === 1) {
    return scales[0];
  }

  const availableScales = scales.filter(
    (scale) => !excludedScaleIds.includes(scale.id),
  );
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

function getScaleCategory(scale: ScalePrompt): ScaleCategory {
  const searchableText = `${scale.name} ${scale.pattern}`.toLowerCase();

  if (searchableText.includes('arpeggio')) {
    return 'arpeggios';
  }

  if (searchableText.includes('chromatic')) {
    return 'chromatic';
  }

  if (searchableText.includes('dominant seventh')) {
    return 'dominantSevenths';
  }

  if (searchableText.includes('diminished seventh')) {
    return 'diminishedSevenths';
  }

  if (searchableText.includes('double-stop')) {
    return 'doubleStops';
  }

  return 'scales';
}

export default function App() {
  const { width } = useWindowDimensions();
  const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
  const [currentScale, setCurrentScale] = useState<PracticePrompt | null>(null);
  const [history, setHistory] = useState<PracticePrompt[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>('classic');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [listModal, setListModal] = useState<'review' | 'easy' | 'hard' | null>(
    null,
  );
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>('normal');
  const [avoidRecentRepeats, setAvoidRecentRepeats] = useState(true);
  const [enabledCategories, setEnabledCategories] =
    useState<CategorySelection>(DEFAULT_CATEGORIES);
  const [easyScaleIds, setEasyScaleIds] = useState<string[]>([]);
  const [hardScaleIds, setHardScaleIds] = useState<string[]>([]);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
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
    () =>
      SCALE_PROMPTS.filter(
        (scale) =>
          scale.grade === selectedGrade &&
          enabledCategories[getScaleCategory(scale)] &&
          (difficultyMode === 'normal' ||
            (difficultyMode === 'easy' && easyScaleIds.includes(scale.id)) ||
            (difficultyMode === 'hard' && hardScaleIds.includes(scale.id))),
      ),
    [difficultyMode, easyScaleIds, enabledCategories, hardScaleIds, selectedGrade],
  );
  const theme = THEMES.find((candidate) => candidate.name === themeName) ?? THEMES[0];
  const hasEnabledCategory = CATEGORIES.some(
    (category) => enabledCategories[category.key],
  );
  const reviewScales = useMemo(
    () => SCALE_PROMPTS.filter((scale) => scale.grade === selectedGrade),
    [selectedGrade],
  );
  const easyScales = useMemo(
    () => SCALE_PROMPTS.filter((scale) => easyScaleIds.includes(scale.id)),
    [easyScaleIds],
  );
  const hardScales = useMemo(
    () => SCALE_PROMPTS.filter((scale) => hardScaleIds.includes(scale.id)),
    [hardScaleIds],
  );
  const isCurrentScaleEasy = currentScale
    ? easyScaleIds.includes(currentScale.id)
    : false;
  const isCurrentScaleHard = currentScale
    ? hardScaleIds.includes(currentScale.id)
    : false;

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (!storedSettings || !isMounted) {
          return;
        }

        const parsedSettings = JSON.parse(storedSettings) as Partial<PersistedSettings>;

        if (
          typeof parsedSettings.selectedGrade === 'number' &&
          GRADES.includes(parsedSettings.selectedGrade)
        ) {
          setSelectedGrade(parsedSettings.selectedGrade);
        }

        if (
          parsedSettings.themeName &&
          THEMES.some((candidate) => candidate.name === parsedSettings.themeName)
        ) {
          setThemeName(parsedSettings.themeName);
        }

        if (
          parsedSettings.difficultyMode &&
          DIFFICULTY_MODES.some(
            (mode) => mode.key === parsedSettings.difficultyMode,
          )
        ) {
          setDifficultyMode(parsedSettings.difficultyMode);
        }

        if (typeof parsedSettings.avoidRecentRepeats === 'boolean') {
          setAvoidRecentRepeats(parsedSettings.avoidRecentRepeats);
        }

        if (parsedSettings.enabledCategories) {
          setEnabledCategories({
            ...DEFAULT_CATEGORIES,
            ...parsedSettings.enabledCategories,
          });
        }

        if (Array.isArray(parsedSettings.easyScaleIds)) {
          setEasyScaleIds(parsedSettings.easyScaleIds);
        }

        if (Array.isArray(parsedSettings.hardScaleIds)) {
          setHardScaleIds(parsedSettings.hardScaleIds);
        }
      } catch (error) {
        console.warn('Could not load settings', error);
      } finally {
        if (isMounted) {
          setHasLoadedSettings(true);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedSettings) {
      return;
    }

    const settings: PersistedSettings = {
      avoidRecentRepeats,
      difficultyMode,
      easyScaleIds,
      enabledCategories,
      hardScaleIds,
      selectedGrade,
      themeName,
    };

    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)).catch(
      (error) => console.warn('Could not save settings', error),
    );
  }, [
    avoidRecentRepeats,
    difficultyMode,
    easyScaleIds,
    enabledCategories,
    hardScaleIds,
    hasLoadedSettings,
    selectedGrade,
    themeName,
  ]);

  const toggleCategory = (category: ScaleCategory) => {
    setEnabledCategories((currentCategories) => {
      const enabledCount = CATEGORIES.filter(
        (option) => currentCategories[option.key],
      ).length;

      if (currentCategories[category] && enabledCount === 1) {
        return currentCategories;
      }

      return {
        ...currentCategories,
        [category]: !currentCategories[category],
      };
    });
    setCurrentScale(null);
    setHistory([]);
  };

  const handleGradeChange = (grade: number) => {
    spinAnimation.stopAnimation();
    spinAnimation.setValue(0);
    setIsSpinning(false);
    setSelectedGrade(grade);
    setCurrentScale(null);
    setHistory([]);
  };

  const toggleEasyScale = (scaleId: string) => {
    setEasyScaleIds((currentIds) => {
      if (currentIds.includes(scaleId)) {
        return currentIds.filter((currentId) => currentId !== scaleId);
      }

      setHardScaleIds((hardIds) =>
        hardIds.filter((hardId) => hardId !== scaleId),
      );
      return [scaleId, ...currentIds];
    });
  };

  const toggleHardScale = (scaleId: string) => {
    setHardScaleIds((currentIds) => {
      if (currentIds.includes(scaleId)) {
        return currentIds.filter((currentId) => currentId !== scaleId);
      }

      setEasyScaleIds((easyIds) =>
        easyIds.filter((easyId) => easyId !== scaleId),
      );
      return [scaleId, ...currentIds];
    });
  };

  const handleSpin = () => {
    if (isSpinning || gradeScales.length === 0) {
      return;
    }

    setIsSpinning(true);
    spinAnimation.setValue(0);
    const excludedScaleIds = avoidRecentRepeats
      ? history.slice(0, 5).map((scale) => scale.id)
      : currentScale
        ? [currentScale.id]
        : [];
    const nextScale = pickRandomScale(gradeScales, excludedScaleIds);
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
  const isWideLayout = width >= 620;
  const visibleListScales =
    listModal === 'review'
      ? reviewScales
      : listModal === 'easy'
        ? easyScales
        : listModal === 'hard'
          ? hardScales
          : [];
  const listTitle =
    listModal === 'review'
      ? `Grade ${selectedGrade} list`
      : listModal === 'easy'
        ? 'Easy list'
        : 'Hard list';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.name === 'contrast' ? 'dark' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
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
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => setIsSettingsOpen(true)}
            style={styles.settingsButton}
          >
            <Text
              style={[
                styles.settingsButtonText,
                { color: theme.text },
                themedFont(theme, semiboldFont, '700'),
              ]}
            >
              ⋯
            </Text>
          </Pressable>
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
          {difficultyMode !== 'normal' && (
            <Text
              style={[
                styles.modeNote,
                { color: theme.mutedText },
                themedFont(theme, regularFont, '400'),
              ]}
            >
              {difficultyMode === 'easy' ? 'Easy mode' : 'Hard mode'}
            </Text>
          )}
          <View
            style={[
              styles.gradeGrid,
              isWideLayout ? styles.gradeGridWide : styles.gradeGridCompact,
            ]}
          >
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
              {currentScale.selectedBowing.length > 0 && (
                <Text
                  style={[
                    styles.resultDetail,
                    { color: theme.labelText },
                    themedFont(theme, bodyFont, '500'),
                  ]}
                >
                  {formatMusicText(currentScale.selectedBowing)}
                </Text>
              )}
              <View style={styles.resultActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleEasyScale(currentScale.id)}
                  style={[
                    styles.resultActionButton,
                    {
                      backgroundColor: isCurrentScaleEasy
                        ? theme.selected
                        : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultActionText,
                      {
                        color: isCurrentScaleEasy
                          ? theme.selectedText
                          : theme.labelText,
                      },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    Easy
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleHardScale(currentScale.id)}
                  style={[
                    styles.resultActionButton,
                    {
                      backgroundColor: isCurrentScaleHard
                        ? theme.selected
                        : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultActionText,
                      {
                        color: isCurrentScaleHard
                          ? theme.selectedText
                          : theme.labelText,
                      },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    Hard
                  </Text>
                </Pressable>
              </View>
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
                {gradeScales.length} prompts available
              </Text>
            </>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSpin}
          disabled={isSpinning || gradeScales.length === 0}
          style={({ pressed }) => [
            styles.spinButton,
            { backgroundColor: theme.primary },
            pressed && styles.spinButtonPressed,
            (isSpinning || gradeScales.length === 0) && styles.spinButtonDisabled,
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
      <Modal
        animationType="slide"
        onRequestClose={() => setIsSettingsOpen(false)}
        transparent
        visible={isSettingsOpen}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.settingsPanel,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.settingsHeader}>
              <Text
                style={[
                  styles.settingsTitle,
                  { color: theme.text },
                  themedFont(theme, boldFont, '700'),
                ]}
              >
                Settings
              </Text>
              <Pressable
                accessibilityLabel="Close settings"
                accessibilityRole="button"
                onPress={() => setIsSettingsOpen(false)}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.selected, borderColor: theme.selected },
                ]}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    { color: theme.selectedText },
                    themedFont(theme, semiboldFont, '700'),
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.settingsContent}>
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
                            backgroundColor: isSelected
                              ? theme.selected
                              : theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.themeButtonText,
                            {
                              color: isSelected
                                ? theme.selectedText
                                : theme.labelText,
                            },
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
                  Practice mode
                </Text>
                <View style={styles.themeRow}>
                  {DIFFICULTY_MODES.map((mode) => {
                    const isSelected = difficultyMode === mode.key;

                    return (
                      <Pressable
                        key={mode.key}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => {
                          setDifficultyMode(mode.key);
                          setCurrentScale(null);
                          setHistory([]);
                        }}
                        style={[
                          styles.themeButton,
                          {
                            backgroundColor: isSelected
                              ? theme.selected
                              : theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.themeButtonText,
                            {
                              color: isSelected
                                ? theme.selectedText
                                : theme.labelText,
                            },
                            themedFont(theme, semiboldFont, '700'),
                          ]}
                        >
                          {mode.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: theme.text },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    Avoid recent repeats
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.mutedText },
                      themedFont(theme, regularFont, '400'),
                    ]}
                  >
                    Skip recently spun prompts when possible.
                  </Text>
                </View>
                <Switch
                  onValueChange={setAvoidRecentRepeats}
                  thumbColor={avoidRecentRepeats ? theme.primary : theme.surface}
                  trackColor={{ false: theme.border, true: theme.selected }}
                  value={avoidRecentRepeats}
                />
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.labelText },
                    themedFont(theme, semiboldFont, '700'),
                  ]}
                >
                  Lists
                </Text>
                <View style={styles.toolList}>
                  {[
                    {
                      key: 'review' as const,
                      label: `Review Grade ${selectedGrade}`,
                      count: reviewScales.length,
                    },
                    {
                      key: 'easy' as const,
                      label: 'Easy list',
                      count: easyScales.length,
                    },
                    {
                      key: 'hard' as const,
                      label: 'Hard list',
                      count: hardScales.length,
                    },
                  ].map((tool) => (
                    <Pressable
                      key={tool.key}
                      accessibilityRole="button"
                      onPress={() => {
                        setIsSettingsOpen(false);
                        setListModal(tool.key);
                      }}
                      style={[
                        styles.toolButton,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.toolButtonText,
                          { color: theme.labelText },
                          themedFont(theme, semiboldFont, '700'),
                        ]}
                      >
                        {tool.label}
                      </Text>
                      <Text
                        style={[
                          styles.toolCount,
                          { color: theme.mutedText },
                          themedFont(theme, regularFont, '400'),
                        ]}
                      >
                        {tool.count}
                      </Text>
                    </Pressable>
                  ))}
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
                  Include
                </Text>
                <View style={styles.filterList}>
                  {CATEGORIES.map((category) => {
                    const isEnabled = enabledCategories[category.key];

                    return (
                      <Pressable
                        key={category.key}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isEnabled }}
                        onPress={() => toggleCategory(category.key)}
                        style={[
                          styles.filterItem,
                          {
                            backgroundColor: isEnabled
                              ? theme.selected
                              : theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterCheck,
                            { color: isEnabled ? theme.selectedText : theme.labelText },
                            themedFont(theme, semiboldFont, '700'),
                          ]}
                        >
                          {isEnabled ? '✓' : ''}
                        </Text>
                        <Text
                          style={[
                            styles.filterLabel,
                            { color: isEnabled ? theme.selectedText : theme.labelText },
                            themedFont(theme, semiboldFont, '700'),
                          ]}
                        >
                          {category.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {!hasEnabledCategory && (
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.accent },
                      themedFont(theme, regularFont, '400'),
                    ]}
                  >
                    Keep at least one type selected.
                  </Text>
                )}
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.labelText },
                    themedFont(theme, semiboldFont, '700'),
                  ]}
                >
                  About
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setIsSettingsOpen(false);
                    setIsAboutOpen(true);
                  }}
                  style={[
                    styles.toolButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.toolButtonText,
                      { color: theme.labelText },
                      themedFont(theme, semiboldFont, '700'),
                    ]}
                  >
                    Data source
                  </Text>
                  <Text
                    style={[
                      styles.toolCount,
                      { color: theme.mutedText },
                      themedFont(theme, regularFont, '400'),
                    ]}
                  >
                    2024
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        onRequestClose={() => setListModal(null)}
        transparent
        visible={listModal !== null}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.settingsPanel,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.settingsHeader}>
              <Text
                style={[
                  styles.settingsTitle,
                  { color: theme.text },
                  themedFont(theme, boldFont, '700'),
                ]}
              >
                {listTitle}
              </Text>
              <Pressable
                accessibilityLabel="Close list"
                accessibilityRole="button"
                onPress={() => setListModal(null)}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.selected, borderColor: theme.selected },
                ]}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    { color: theme.selectedText },
                    themedFont(theme, semiboldFont, '700'),
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.settingsContent}>
              {visibleListScales.length > 0 ? (
                visibleListScales.map((scale) => (
                  <View
                    key={scale.id}
                    style={[
                      styles.listItem,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.listItemText}>
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
                    {listModal !== 'review' && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          listModal === 'easy'
                            ? toggleEasyScale(scale.id)
                            : toggleHardScale(scale.id)
                        }
                        style={[
                          styles.removeButton,
                          { borderColor: theme.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.removeButtonText,
                            { color: theme.labelText },
                            themedFont(theme, semiboldFont, '700'),
                          ]}
                        >
                          Remove
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))
              ) : (
                <Text
                  style={[
                    styles.emptyHistory,
                    { color: theme.mutedText },
                    themedFont(theme, regularFont, '400'),
                  ]}
                >
                  Nothing here yet.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        onRequestClose={() => setIsAboutOpen(false)}
        transparent
        visible={isAboutOpen}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.settingsPanel,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.settingsHeader}>
              <Text
                style={[
                  styles.settingsTitle,
                  { color: theme.text },
                  themedFont(theme, boldFont, '700'),
                ]}
              >
                Data source
              </Text>
              <Pressable
                accessibilityLabel="Close data source"
                accessibilityRole="button"
                onPress={() => setIsAboutOpen(false)}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.selected, borderColor: theme.selected },
                ]}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    { color: theme.selectedText },
                    themedFont(theme, semiboldFont, '700'),
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.settingsContent}>
              <Text
                style={[
                  styles.aboutText,
                  { color: theme.text },
                  themedFont(theme, regularFont, '400'),
                ]}
              >
                ScaleRoulette contains violin scale and arpeggio prompts extracted
                from the ABRSM Bowed Strings Practical Grades syllabus from 2024.
              </Text>
              <Text
                style={[
                  styles.aboutText,
                  { color: theme.text },
                  themedFont(theme, regularFont, '400'),
                ]}
              >
                The app is designed as a practice aid. Please cross-check the
                official syllabus before relying on any prompt for exam
                preparation.
              </Text>
              <Text
                style={[
                  styles.aboutText,
                  { color: theme.text },
                  themedFont(theme, regularFont, '400'),
                ]}
              >
                ScaleRoulette is not affiliated with, endorsed by, or sponsored by
                ABRSM.
              </Text>
              <Text
                style={[
                  styles.aboutText,
                  { color: theme.mutedText },
                  themedFont(theme, regularFont, '400'),
                ]}
              >
                Settings and easy/hard lists are stored locally on this device.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
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
  modeNote: {
    fontSize: 18,
    marginTop: -6,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gradeGridCompact: {
    maxWidth: 276,
  },
  gradeGridWide: {
    maxWidth: 564,
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
  settingsButton: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  settingsButtonText: {
    fontSize: 34,
    lineHeight: 34,
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
  resultActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  resultActionButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 40,
    minWidth: 92,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  resultActionText: {
    fontSize: 18,
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
  aboutText: {
    fontSize: 18,
    lineHeight: 24,
  },
  spinningState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWheel: {
    height: 112,
    width: 112,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  settingsPanel: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    maxHeight: '86%',
    padding: 24,
  },
  settingsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 34,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  closeButtonText: {
    fontSize: 30,
    lineHeight: 34,
  },
  settingsContent: {
    gap: 24,
    paddingBottom: 12,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'space-between',
  },
  settingTextGroup: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 20,
  },
  settingDescription: {
    fontSize: 16,
    lineHeight: 20,
  },
  filterList: {
    gap: 10,
  },
  toolList: {
    gap: 10,
  },
  toolButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  toolButtonText: {
    fontSize: 19,
  },
  toolCount: {
    fontSize: 17,
  },
  filterItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  filterCheck: {
    fontSize: 20,
    textAlign: 'center',
    width: 22,
  },
  filterLabel: {
    fontSize: 19,
  },
  listItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  listItemText: {
    flex: 1,
  },
  removeButton: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  removeButtonText: {
    fontSize: 15,
  },
});
