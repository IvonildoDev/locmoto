import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { ClientesProvider } from '../context/ClientesContext';
import { MotosProvider } from '../context/MotosContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');

// Custom Splash Screen Component
function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [textFadeAnim] = useState(new Animated.Value(0));
  const [sloganFadeAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animação de entrada
    Animated.sequence([
      // Logo aparece com scale e fade
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Texto aparece
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Slogan aparece junto com a barra de progresso
      Animated.parallel([
        Animated.timing(sloganFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Aguarda um momento
      Animated.delay(300),
    ]).start(() => {
      // Fade out e finaliza
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(sloganFadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(onFinish);
    });
  }, []);

  return (
    <View style={splashStyles.container}>
      {/* Círculos decorativos de fundo */}
      <View style={splashStyles.circle1} />
      <View style={splashStyles.circle2} />
      <View style={splashStyles.circle3} />

      {/* Logo Container */}
      <Animated.View
        style={[
          splashStyles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Ícone da Moto */}
        <View style={splashStyles.iconCircle}>
          <Text style={splashStyles.iconText}>🏍️</Text>
        </View>
      </Animated.View>

      {/* Texto LocMoto */}
      <Animated.View style={{ opacity: textFadeAnim }}>
        <Text style={splashStyles.title}>
          <Text style={splashStyles.titleLoc}>LOC</Text>
          <Text style={splashStyles.titleMoto}>MOTO</Text>
        </Text>
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={{ opacity: sloganFadeAnim }}>
        <Text style={splashStyles.slogan}>"Aqui a estrada é sua."</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[splashStyles.loadingContainer, { opacity: sloganFadeAnim }]}>
        <View style={splashStyles.loadingBar}>
          <Animated.View 
            style={[
              splashStyles.loadingProgress,
              { 
                transform: [{ scaleX: progressAnim }],
              }
            ]} 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -width * 0.5,
    left: -width * 0.25,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -width * 0.3,
    right: -width * 0.3,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    top: '40%',
    left: -width * 0.4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconText: {
    fontSize: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 2,
  },
  titleLoc: {
    color: '#FFF',
  },
  titleMoto: {
    color: '#1A1A1A',
  },
  slogan: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: width * 0.5,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
    transformOrigin: 'left',
  },
});

// Custom dark theme for LocMoto
const LocMotoTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.shared.primary,
    background: Colors.shared.darkBg,
    card: Colors.shared.cardBg,
    text: '#FFF',
    border: Colors.shared.cardBg,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showSplash, setShowSplash] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (showSplash) {
    return <CustomSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ClientesProvider>
      <MotosProvider>
        <ThemeProvider value={LocMotoTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.shared.darkBg },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="moto-details" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="rent" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </MotosProvider>
    </ClientesProvider>
  );
}
