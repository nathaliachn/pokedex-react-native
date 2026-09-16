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

The test suite compiles the tests into `dist-test/` and runs them with Node's built-in test runner. It covers PokéAPI mapping, datasource success and failure paths, domain use cases, pagination deduplication, and persistence/fallback behavior.

Latest local verification:

- `npm run typecheck`: passed.
- `npm test`: 26 tests passed across 7 suites.
- `git diff --check`: passed.

Simulator checks were not run in this verification session.

## Persistence and partial offline support

The assessment allows Expo but restricts external libraries. With explicit approval,
`expo-file-system` is the only added direct dependency: a first-party Expo module,
rather than a community storage library. SDK 57's modern `File`, `Directory`, and
`Paths.document` APIs store JSON under the app's documents directory in `pokemon-v1/`.
No legacy FileSystem APIs or temporary cache directory are used.

The composition root wraps the remote repository with `CachedPokemonRepository`.
`PokemonCache` serializes and validates domain data through an injected `TextStorage`
interface; `ExpoFileTextStorage` handles device files. Domain and UI have no storage
dependencies. Each successfully fetched page is saved by limit/offset, including its
next offset; fetched details are saved by ID. Writes replace the corresponding entry.

Requests always try the network first. Fetch/connectivity failures (including a failed
response-body download) fall back to that exact saved page or detail. Fresh remote data
always wins. HTTP errors and malformed remote JSON retain the existing error behavior.
Missing, malformed, or unreadable saved data preserves the network error and the UI's
friendly retry state. A failed write never discards a successful remote response.

Previously fetched pages and details survive navigation and app process restarts.
Offline pagination can continue through saved pages; an uncached next page shows the
existing footer retry state. Existing ID-based list merging prevents overlapping or
retried pages from introducing duplicates. Only image URLs are stored: image display
offline depends on the platform image cache and is not guaranteed. Unvisited details
and unfetched pages are not available offline.

Trade-offs: network-first fallback waits for the request to fail; there is no added
timeout or connectivity monitor. Saved data has no expiry, eviction, encryption, or
migration (the folder is schema-versioned), so it can become stale and storage grows
with browsing. Small JSON writes use the synchronous File API and are not transactional;
an interrupted write may lose that cache entry, which validation treats as unavailable.
Clearing app data/uninstalling removes the saved data. Tests use an injected storage
double and recreate repositories/cache instances; they do not prove native disk
durability or simulate an actual process restart.

### Manual iOS / Android verification

- Online, fetch multiple pages and open several details; confirm pagination/navigation.
- Terminate the app, disable connectivity, then relaunch: verify saved pages/details.
- Scroll past the last saved page and open a detail never visited: verify friendly retry.
- Restore connectivity and retry: verify fresh data loads without duplicate list entries.
- With cleared app data and no connection, verify the initial friendly error/retry state.
- In Expo Go, ensure the JS bundle can load before testing offline; a cold launch that
  needs Metro is separate from Pokémon data persistence. Use an installed build for
  a fully offline process-restart check.

## UI, accessibility, and platform limits

Screens share a constrained reading width, scalable text, native loading feedback,
48-point minimum action targets, and explicit Retry/Back labels. Loading feedback
exposes a busy state; Android status messages use polite live regions. Decorative
images and chevrons are excluded from screen-reader focus. Detail measurements and
stats group their labels with values. Type badges include their text labels and use
contrast-safe accents; stat bars use a bounded 0–255 scale while retaining numeric
values. Stat bars use a visual 0–150 scale and clamp only the bar, while accessibility
retains the exact numeric value. The list supports native pull-to-refresh for a first-page network refresh,
separate from initial and pagination loading. Error/loading screens scroll at large font sizes;
the list remains a FlatList with stable ID keys and memoized rows. Automatic end-of-list
requests pause after a pagination error until the user presses Retry.

List search is local and limited to already-loaded names and numbers; it never starts
network requests, and the API total remains visible while results are filtered. List
cards stay neutral because the list endpoint does not provide types and enriching every
row would require one detail request per Pokémon. Detail content uses an About/Stats
segmented control so the artwork/profile and stat visualization do not create one long
scrolling page.

React Native 0.86's public core SafeAreaView is deprecated and only protects iOS.
The app uses Expo SDK 57's compatible `react-native-safe-area-context` provider and
native SafeAreaView to apply dynamic top and bottom insets on iOS and Android,
including gesture and three-button navigation. The deprecated core component and
manual status-bar padding are no longer used.

UI checks remain manual: test VoiceOver/TalkBack reading order and Retry/Back actions,
maximum text/display size, smallest supported screen and tablet width, light/dark
system settings (the app remains light), and all loading/error/empty/footer states.
Check iOS notches/home indicators and Android gesture **and** three-button navigation,
especially the last list row, pagination Retry, and final detail stats. Existing
hardware Back behavior is preserved. Automated tests do not validate native layout,
screen-reader announcements, or full Apple HIG/Material compliance.
