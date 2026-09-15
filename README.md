# Pokédex

Expo React Native app for browsing Pokémon from PokéAPI.

## Requirements

- Node.js compatible with Expo SDK 57.
- npm.

## Run

```sh
npm install
npm start
```

Use the Expo CLI options to open the app on iOS or Android when simulators or devices are available.

## Verification

```sh
npm run typecheck
npm test
git diff --check
```

The test suite compiles the domain/data tests into `dist-test/` and runs them with Node's built-in test runner. It covers PokéAPI mapping, datasource success and failure paths, and domain use cases.

Latest local verification for the detail/navigation block:

- `npm run typecheck`: passed.
- `npm test`: 12 tests passed across 5 suites.
- `git diff --check`: passed.

Simulator checks were not run in this verification session.
