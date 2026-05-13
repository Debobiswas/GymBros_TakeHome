# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

GymBros Biking Shop — a 3-screen React Native app (Discover, Detail, Cart) built with Expo Router. Target devices: iPhone 13 mini (375pt) and iPhone 17 Pro Max (~430pt).

## Commands

```bash
npx expo start          # Start dev server + QR code for Expo Go
npx expo run:ios        # Native iOS build
npx expo run:android    # Native Android build
npx expo install <pkg>  # Add dependency (keeps SDK version compatibility)
npx expo lint           # ESLint via Expo config
npx tsc --noEmit        # Type-check without emitting
```

## Architecture

### Routing
Expo Router v4 (`app/` directory). Three screens: `app/index.tsx` (Discover), `app/detail.tsx` (Product Detail), `app/cart.tsx` (Cart). `app/_layout.tsx` wraps everything in `GestureHandlerRootView`, loads Poppins fonts, and hides the splash screen on font load.

### Styling approach
**Both** `StyleSheet.create` (for most layout/style) and NativeWind Tailwind classes are available. In practice, all three screens and components use `StyleSheet.create` exclusively — NativeWind is configured but not actively used. Do not mix both approaches in the same component.

### Responsiveness
All pixel values are derived from a 390pt design baseline using a scale factor:
```ts
const scale = width / 390;  // from useWindowDimensions()
```
This is used directly in inline styles rather than Tailwind classes.

### Animations
All animations use `react-native-reanimated` v3 exclusively:
- `useSharedValue` + `useAnimatedStyle` + `withSpring` / `withTiming` / `withDelay`
- Tap/press gestures: `Gesture.Tap()` via `react-native-gesture-handler` wrapped in `GestureDetector`
- Worklet functions annotated with `'worklet'`; bridging to JS via `runOnJS(fn)()`

### Theme
All design tokens live in `constants/theme.ts` (`COLORS`, `GRADIENTS`, `FONT`, `RADIUS`). Tailwind equivalents exist in `tailwind.config.js` but the TS constants are the source of truth used by components.

Image URIs (Figma CDN) are in `constants/images.ts`. These expire periodically — replace with new CDN URLs or local assets if images break.

### Data
`hooks/useApiData.ts` fetches `https://api.restful-api.dev/objects`, filters to entries with non-empty `data`, and returns the first 5. Used only in the Specification tab of the Detail screen.

Product/cart data is static in `constants/products.ts`. The masonry grid uses pre-split `LEFT_PRODUCTS` / `RIGHT_PRODUCTS` arrays — left column gets `marginTop: 31` per the Figma offset. Each `Product` has a `cardHeight` field (Figma frame height in pt) that is metadata only — the actual rendered height is driven by content, not this value.

`INITIAL_CART` in `constants/products.ts` is the static starting state for the Cart screen; there is no global state or context — each screen manages its own state with `useState`.

### Navigation
The Detail screen is reached via `router.push({ pathname: '/detail', params: { id, name } })`. It reads `name` from `useLocalSearchParams` to display the product title. The Cart screen is reached via `router.push('/cart')`.

### Icons
All icons are custom SVG components in `components/icons/` (using `react-native-svg`). The `lucide-react-native` package is installed but **not used** — do not reach for it when adding new icons; create a matching SVG component instead.

### Figma node mapping
Each screen's top-level comment references its Figma node ID:
- Discover: `1:38`
- Detail: `1:557`
- Cart: `1:210`

### BottomTabBar
The most complex component. Key geometry constants at the top of `components/BottomTabBar.tsx`:
- `SLANT_DEPTH` / `SLANT_SPAN` — SVG polygon points for the slanted background shape
- `PILL_SKEW` — parallelogram skew angle for the active indicator
- `PILL_W_BASE` / `PILL_H` — active pill dimensions at 390pt baseline

The pill is a 3-layer absolute stack: glow shadow → skewed `LinearGradient` → un-skewed icon overlay. The slide animation uses a single `pilTranslateX` shared value spring-driven on `activeTab` change.

### NativeWind configuration
Three files must stay in sync if adding new Tailwind tokens:
1. `tailwind.config.js` — token definitions
2. `constants/theme.ts` — TypeScript equivalents used in `StyleSheet.create`
3. `global.css` (imported in `_layout.tsx`) — triggers NativeWind's CSS processing

Babel preset uses `jsxImportSource: 'nativewind'`; Metro is wrapped with `withNativeWind`.
