import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { COLORS } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(COLORS.bg);
    if (Platform.OS !== 'android') return;
    void (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync(COLORS.bg);
        await NavigationBar.setBorderColorAsync(COLORS.bg);
        await NavigationBar.setButtonStyleAsync('light');
      } catch {
        /* Expo Go / unsupported */
      }
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1, backgroundColor: COLORS.bg },
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="detail" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="map" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="docs" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
