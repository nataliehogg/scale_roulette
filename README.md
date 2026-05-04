# ScaleRoulette

ScaleRoulette is a small violin practice app for students preparing scale requirements for graded music exams. Pick a grade, spin the wheel, and get a random scale, arpeggio, chromatic scale, seventh, or double-stop prompt to practise.

The app is built with Expo and React Native, so the same codebase can run on Android, iOS, and the web.

## Features

- Random scale prompt by grade
- Grade 1-8 violin scale data
- Separate/slurred bowing selected at random where applicable
- Filters for scales, arpeggios, chromatic scales, sevenths, and double-stops
- Easy/Normal/Hard practice modes
- Easy and Hard lists stored locally
- Recent spin history
- Grade review list for teachers, parents, and students to check what is included
- Classic, Bright, and Contrast themes
- Web and Android distribution support

## Data Source

Scale prompts were extracted from the ABRSM Bowed Strings Practical Grades syllabus from 2024. ScaleRoulette is intended as a practice aid, not an official syllabus source. Please cross-check the official syllabus before relying on any prompt for exam preparation.

ScaleRoulette is not affiliated with, endorsed by, or sponsored by ABRSM.

## Privacy

ScaleRoulette does not collect personal data, use accounts, analytics, advertising, or tracking. Settings and Easy/Hard lists are stored locally on the user's device.

See [PRIVACY.md](PRIVACY.md).

## Development

Use Node 20 or newer.

```bash
npm install
npm run start
```

Run the web preview:

```bash
npm run web
```

Run TypeScript validation:

```bash
npx tsc --noEmit
```

## Distribution

Build the static web app:

```bash
npm run export:web
```

The output is written to `dist/` and can be hosted with GitHub Pages or any static web host.

Build a preview Android APK with EAS:

```bash
npx eas login
npm run build:apk
```

The APK build requires a free Expo account and EAS project setup. It does not require a Google Play Developer account.

For Google Play later, use the production EAS profile to build an Android App Bundle:

```bash
npx eas build --platform android --profile production
```
