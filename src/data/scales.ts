export type ScalePrompt = {
  id: string;
  grade: number;
  name: string;
  pattern: string;
  bowingOptions: string[];
};

export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];

const scaleBowing = (slur: string) =>
  ['Separate bows', `Slurred (${slur})`];

const evenBowing = (slur?: string) =>
  slur ? ['Separate bows', `Slurred (${slur})`] : ['Separate bows'];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const prompt = (
  grade: number,
  name: string,
  pattern: string,
  bowingOptions: string[],
): ScalePrompt => ({
  id: `g${grade}-${slugify(`${name}-${pattern}`)}`,
  grade,
  name,
  pattern,
  bowingOptions,
});

const prompts = (
  grade: number,
  names: string[],
  pattern: string,
  bowingOptions: string[],
) => names.map((name) => prompt(grade, name, pattern, bowingOptions));

const minorForms = (keys: string[]) =>
  keys.flatMap((key) => [`${key} harmonic minor`, `${key} melodic minor`]);

// Source: ABRSM Bowed Strings Practical Grades syllabus from 2024, violin
// scales and arpeggios sections. Initial Grade is omitted for now because the
// app starts at Grade 1.
export const SCALE_PROMPTS: ScalePrompt[] = [
  ...prompts(1, ['D major', 'A major'], 'Scale, 1 octave', scaleBowing('2 quavers to a bow')),
  prompt(1, 'E natural minor', 'Scale, 1 octave', scaleBowing('2 quavers to a bow')),
  prompt(1, 'G major', 'Scale, 2 octaves', scaleBowing('2 quavers to a bow')),
  ...prompts(1, ['D major', 'A major'], 'Arpeggio, 1 octave', evenBowing()),
  prompt(1, 'E minor', 'Arpeggio, 1 octave', evenBowing()),
  prompt(1, 'G major', 'Arpeggio, 2 octaves', evenBowing()),

  ...prompts(2, ['G minor', 'D minor'], 'Scale, 1 octave; natural, harmonic or melodic at candidate choice', scaleBowing('2 quavers to a bow')),
  ...prompts(2, ['C major', 'F major'], 'Scale, 1 octave', scaleBowing('2 quavers to a bow')),
  ...prompts(2, ['G major', 'A major', 'B-flat major'], 'Scale, 2 octaves', scaleBowing('2 quavers to a bow')),
  ...prompts(2, ['C major', 'F major', 'G minor', 'D minor'], 'Arpeggio, 1 octave', evenBowing()),
  ...prompts(2, ['G major', 'A major', 'B-flat major'], 'Arpeggio, 2 octaves', evenBowing()),

  ...prompts(3, ['A-flat major', 'E-flat major', 'E major'], 'Scale, 1 octave', scaleBowing('2 quavers to a bow')),
  ...prompts(3, ['B-flat major', 'D major'], 'Scale, 2 octaves', scaleBowing('2 quavers to a bow')),
  ...prompts(3, ['A minor', 'D minor'], 'Scale, 2 octaves; harmonic or melodic at candidate choice', scaleBowing('2 quavers to a bow')),
  ...prompts(3, ['A-flat major', 'E-flat major', 'E major'], 'Arpeggio, 1 octave', evenBowing('3 notes to a bow')),
  ...prompts(3, ['B-flat major', 'D major', 'A minor', 'D minor'], 'Arpeggio, 2 octaves', evenBowing('3 notes to a bow')),
  prompt(3, 'Chromatic starting on open D', 'Chromatic scale, 1 octave', evenBowing()),

  ...prompts(4, ['A-flat major', 'B major', 'C major', 'E major'], 'Scale, 2 octaves', scaleBowing('2 beats to a bow')),
  ...prompts(4, ['G minor', 'B minor', 'C minor'], 'Scale, 2 octaves; harmonic or melodic at candidate choice', scaleBowing('2 beats to a bow')),
  ...prompts(4, ['A-flat major', 'B major', 'C major', 'E major', 'G minor', 'B minor', 'C minor'], 'Arpeggio, 2 octaves', evenBowing('3 notes to a bow')),
  prompt(4, 'Dominant seventh in C, starting on open G', 'Dominant seventh resolving on tonic, 1 octave', evenBowing()),
  prompt(4, 'Dominant seventh in D, starting on bottom A', 'Dominant seventh resolving on tonic, 1 octave', evenBowing()),
  prompt(4, 'Chromatic starting on bottom A', 'Chromatic scale, 1 octave', evenBowing('4 notes to a bow')),
  prompt(4, 'Chromatic starting on bottom E', 'Chromatic scale, 1 octave', evenBowing('4 notes to a bow')),

  ...prompts(5, ['D-flat major', 'E-flat major', 'F major'], 'Scale, 2 octaves', scaleBowing('2 beats to a bow')),
  ...prompts(5, ['B minor', 'C-sharp minor', 'E minor'], 'Scale, 2 octaves; harmonic or melodic at candidate choice', scaleBowing('2 beats to a bow')),
  ...prompts(5, ['G major', 'A major'], 'Scale, 3 octaves', scaleBowing('2 beats to a bow')),
  ...prompts(5, ['G minor', 'A minor'], 'Scale, 3 octaves; harmonic or melodic at candidate choice', scaleBowing('2 beats to a bow')),
  ...prompts(5, ['D-flat major', 'E-flat major', 'F major', 'B minor', 'C-sharp minor', 'E minor'], 'Arpeggio, 2 octaves', evenBowing('3 notes to a bow')),
  ...prompts(5, ['G major', 'A major', 'G minor', 'A minor'], 'Arpeggio, 3 octaves', evenBowing('3 notes to a bow')),
  prompt(5, 'Dominant seventh in B-flat, starting on F', 'Dominant seventh resolving on tonic, 1 octave', evenBowing('4 notes to a bow')),
  ...prompts(5, ['Dominant seventh in C, starting on G', 'Dominant seventh in D, starting on A'], 'Dominant seventh resolving on tonic, 2 octaves', evenBowing('4 notes to a bow')),
  prompt(5, 'Diminished seventh starting on open G', 'Diminished seventh, 1 octave', evenBowing()),
  prompt(5, 'Diminished seventh starting on open D', 'Diminished seventh, 1 octave', evenBowing()),
  ...prompts(5, ['Chromatic starting on G', 'Chromatic starting on A', 'Chromatic starting on B-flat'], 'Chromatic scale, 2 octaves', evenBowing('4 notes to a bow')),

  ...prompts(6, ['C major', 'E-flat major', 'F-sharp major', ...minorForms(['C', 'E-flat', 'F-sharp'])], 'Scale, 2 octaves', scaleBowing('7 notes to a bow')),
  ...prompts(6, ['G major', 'B-flat major', ...minorForms(['G', 'B-flat'])], 'Scale, 3 octaves', scaleBowing('7 notes to a bow')),
  ...prompts(6, ['C major', 'E-flat major', 'F-sharp major', 'C minor', 'E-flat minor', 'F-sharp minor'], 'Arpeggio, 2 octaves', evenBowing('6 notes to a bow')),
  ...prompts(6, ['G major', 'B-flat major', 'G minor', 'B-flat minor'], 'Arpeggio, 3 octaves', evenBowing('3 notes to a bow')),
  ...prompts(6, ['Dominant seventh in C, starting on G', 'Dominant seventh in E-flat, starting on B-flat', 'Dominant seventh in F, starting on C'], 'Dominant seventh resolving on tonic, 2 octaves', evenBowing('4 notes to a bow')),
  ...prompts(6, ['Diminished seventh starting on G', 'Diminished seventh starting on B-flat', 'Diminished seventh starting on C'], 'Diminished seventh, 2 octaves', evenBowing('4 notes to a bow')),
  ...prompts(6, ['Chromatic starting on G', 'Chromatic starting on B-flat', 'Chromatic starting on C'], 'Chromatic scale, 2 octaves', evenBowing('6 notes to a bow')),
  prompt(6, 'B-flat major in sixths', 'Double-stop scale in broken steps, 1 octave', ['See syllabus pattern on page 16']),

  ...prompts(7, ['F major', 'F-sharp major', ...minorForms(['F', 'F-sharp'])], 'Scale, 2 octaves', scaleBowing('7 notes to a bow')),
  ...prompts(7, ['A major', 'B major', 'D major', ...minorForms(['A', 'B', 'D'])], 'Scale, 3 octaves', scaleBowing('7 notes to a bow')),
  ...prompts(7, ['F major', 'F-sharp major', 'F minor', 'F-sharp minor'], 'Arpeggio, 2 octaves', evenBowing('6 notes to a bow')),
  ...prompts(7, ['A major', 'B major', 'D major', 'A minor', 'B minor', 'D minor'], 'Arpeggio, 3 octaves', evenBowing('3 notes to a bow')),
  ...prompts(7, ['Dominant seventh in G, starting on D', 'Dominant seventh in B-flat, starting on F'], 'Dominant seventh resolving on tonic, 2 octaves', evenBowing('4 notes to a bow')),
  ...prompts(7, ['Dominant seventh in D, starting on A', 'Dominant seventh in E, starting on B'], 'Dominant seventh resolving on tonic, 3 octaves', evenBowing('4 notes to a bow')),
  ...prompts(7, ['Diminished seventh starting on D', 'Diminished seventh starting on F'], 'Diminished seventh, 2 octaves', evenBowing('4 notes to a bow')),
  ...prompts(7, ['Diminished seventh starting on A', 'Diminished seventh starting on B'], 'Diminished seventh, 3 octaves', evenBowing('4 notes to a bow')),
  ...prompts(7, ['Chromatic starting on D', 'Chromatic starting on F'], 'Chromatic scale, 2 octaves', evenBowing('12 notes to a bow')),
  ...prompts(7, ['Chromatic starting on A', 'Chromatic starting on B'], 'Chromatic scale, 3 octaves', evenBowing('12 notes to a bow')),
  ...prompts(7, ['G major in sixths', 'B-flat major in sixths', 'D major in octaves'], 'Double-stop scale in broken steps, 1 octave', ['See syllabus pattern on page 16']),

  ...prompts(8, ['A-flat/G-sharp major', 'C major', 'D-flat/C-sharp major', 'E-flat major', 'E major', ...minorForms(['A-flat/G-sharp', 'C', 'D-flat/C-sharp', 'E-flat', 'E'])], 'Scale, 3 octaves', scaleBowing('7 notes to a bow')),
  ...prompts(8, ['A-flat/G-sharp major', 'C major', 'D-flat/C-sharp major', 'E-flat major', 'E major', 'A-flat/G-sharp minor', 'C minor', 'D-flat/C-sharp minor', 'E-flat minor', 'E minor'], 'Arpeggio, 3 octaves', evenBowing('9 notes to a bow')),
  ...prompts(8, ['Dominant seventh in D-flat, starting on A-flat', 'Dominant seventh in F, starting on C', 'Dominant seventh in A-flat, starting on E-flat', 'Dominant seventh in A, starting on E'], 'Dominant seventh resolving on tonic, 3 octaves', evenBowing('4 notes to a bow')),
  ...prompts(8, ['Diminished seventh starting on C', 'Diminished seventh starting on E-flat', 'Diminished seventh starting on E'], 'Diminished seventh, 2 octaves', evenBowing('4 notes to a bow')),
  prompt(8, 'Diminished seventh starting on A-flat', 'Diminished seventh, 3 octaves', evenBowing('4 notes to a bow')),
  ...prompts(8, ['Chromatic starting on C', 'Chromatic starting on E-flat', 'Chromatic starting on E'], 'Chromatic scale, 2 octaves', evenBowing('12 notes to a bow')),
  prompt(8, 'Chromatic starting on A-flat', 'Chromatic scale, 3 octaves', evenBowing('12 notes to a bow')),
  prompt(8, 'D major in octaves', 'Double-stop scale in parallel, 1 octave', ['Separate bows']),
  prompt(8, 'G harmonic minor in octaves', 'Double-stop scale in parallel, 1 octave', ['Separate bows']),
  prompt(8, 'G melodic minor in octaves', 'Double-stop scale in parallel, 1 octave', ['Separate bows']),
  prompt(8, 'E-flat major in sixths', 'Double-stop scale in parallel, 2 octaves', ['Separate bows']),
  prompt(8, 'B-flat major in thirds', 'Double-stop scale in broken steps, 2 octaves', ['See syllabus pattern on page 16']),
];
