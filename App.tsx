import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useTheme } from './src/theme/theme';
import { useFonts } from 'expo-font';
import { GloriaHallelujah_400Regular } from '@expo-google-fonts/gloria-hallelujah';
import { Caveat_400Regular } from '@expo-google-fonts/caveat';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';
import { IndieFlower_400Regular } from '@expo-google-fonts/indie-flower';
import { ShadowsIntoLight_400Regular } from '@expo-google-fonts/shadows-into-light';

function RootApp() {
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    GloriaHallelujah_400Regular,
    Caveat_400Regular,
    Pacifico_400Regular,
    DancingScript_400Regular,
    IndieFlower_400Regular,
    ShadowsIntoLight_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <>
      <AppNavigator />
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
