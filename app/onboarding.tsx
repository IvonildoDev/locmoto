import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    title: 'Sua Liberdade em Duas Rodas',
    features: [
      { icon: 'location', title: 'Encontre motos perto de você', subtitle: 'Localize e reserve em minutos.' },
      { icon: 'shield-checkmark', title: 'Seguro e suporte', subtitle: 'Pilote com tranquilidade e segurança.' },
    ],
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
    title: 'Escolha Seu Modelo',
    features: [
      { icon: 'bicycle', title: 'Diversos modelos', subtitle: 'De scooters a motos esportivas.' },
      { icon: 'calendar', title: 'Flexibilidade', subtitle: 'Alugue por dias, semanas ou meses.' },
    ],
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800',
    title: 'Pagamento Fácil',
    features: [
      { icon: 'card', title: 'Pague como preferir', subtitle: 'Cartão, PIX ou dinheiro.' },
      { icon: 'star', title: 'Programa de fidelidade', subtitle: 'Ganhe pontos a cada aluguel.' },
    ],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.logoContainer}>
        <Ionicons name="bicycle" size={32} color={Colors.shared.primary} />
        <Text style={styles.logoText}>LocMoto</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.featuresContainer}>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={28} color="#FFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title="Criar Conta"
          onPress={() => router.replace('/(tabs)')}
          variant="primary"
          size="large"
          style={styles.createButton}
        />
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.loginText}>Já tenho uma conta. <Text style={styles.loginLink}>Entrar</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.shared.darkBg,
  },
  slide: {
    width,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: height * 0.3,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.shared.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureText: {
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: Colors.shared.gray,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.shared.gray,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  createButton: {
    width: '100%',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 16,
    color: Colors.shared.gray,
    textAlign: 'center',
  },
  loginLink: {
    color: Colors.shared.primary,
    fontWeight: '600',
  },
});
