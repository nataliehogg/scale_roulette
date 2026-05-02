# ScaleRoulette

Violin scale practice app for ABRSM-style exam preparation. Pick a grade, spin, and get a random scale prompt to practise.

## Development

```bash
npm install
npm run start
```

The current app uses Expo and React Native, so the same codebase can target Android and iOS. iOS builds require macOS/Xcode or Expo's hosted build service.

## Data

The scale prompts in `src/data/scales.ts` were extracted from the ABRSM Bowed Strings Practical Grades syllabus from 2024 PDF. Cross-check the entries before relying on them for exam preparation.
