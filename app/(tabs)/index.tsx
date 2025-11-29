import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationCard } from '../../components/LocationCard';
import Colors from '../../constants/Colors';
import { useMotos } from '../../context/MotosContext';
import { Location, Motorcycle } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64;

// Localização fixa da LocMoto
const locacaoLocMoto: Location = {
  id: '1',
  name: 'LocMoto Pilar',
  address: 'Rua 7 de Maio, Chã do Pilar',
  distance: 'Pilar, AL',
  isOpen: true,
  hours: '08:00 - 18:00',
  type: 'store',
  coordinates: {
    latitude: -9.5989,
    longitude: -35.9567,
  },
};

export default function HomeScreen() {
  const { motos } = useMotos();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderMotoCarouselCard = ({ item }: { item: Motorcycle }) => (
    <TouchableOpacity
      style={styles.carouselCard}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: '/moto-details',
        params: { id: item.id }
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.carouselImage} />
      <View style={styles.carouselContent}>
        <View style={styles.carouselInfo}>
          <Text style={styles.carouselBrand}>{item.brand}</Text>
          <Text style={styles.carouselModel}>{item.model}</Text>
          <Text style={styles.carouselSpecs}>{item.year} • {item.specs.cc}cc • {item.specs.transmission}</Text>
          <Text style={styles.carouselPrice}>R$ {item.dailyRate.toFixed(2).replace('.', ',')}/dia</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.available ? styles.statusDisponivel : styles.statusLocada
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.available ? '#27ae60' : '#e74c3c' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: item.available ? '#27ae60' : '#e74c3c' }
          ]}>
            {item.available ? 'Disponível' : 'Locada'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LocMoto</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carrossel de Motos */}
        <View style={styles.carouselSection}>
          <Text style={styles.sectionTitle}>Nossas Motos</Text>
          
          <FlatList
            ref={flatListRef}
            data={motos}
            renderItem={renderMotoCarouselCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
          
          {/* Indicadores */}
          <View style={styles.pagination}>
            {motos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* Resumo de Status */}
          <View style={styles.statusSummary}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: '#27ae60' }]} />
              <Text style={styles.summaryText}>
                {motos.filter(m => m.available).length} Disponíveis
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.summaryText}>
                {motos.filter(m => !m.available).length} Locadas
              </Text>
            </View>
          </View>
        </View>

        {/* Locations List */}
        <View style={styles.locationsContainer}>
          <Text style={styles.sectionTitle}>Nossa Localização</Text>
          <LocationCard
            location={locacaoLocMoto}
            onPress={() => router.push('/rent')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.shared.darkBg,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  // Carrossel
  carouselSection: {
    marginTop: 8,
  },
  carouselContainer: {
    paddingHorizontal: 16,
  },
  carouselCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  carouselImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2D2D2D',
  },
  carouselContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carouselInfo: {
    flex: 1,
  },
  carouselBrand: {
    fontSize: 14,
    color: Colors.shared.gray,
  },
  carouselModel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
  },
  carouselSpecs: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  carouselPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.shared.primary,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDisponivel: {
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  statusLocada: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Paginação
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.shared.gray,
  },
  paginationDotActive: {
    backgroundColor: Colors.shared.primary,
    width: 24,
  },
  // Resumo de Status
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  // Localizações
  locationsContainer: {
    marginTop: 24,
    paddingBottom: 100,
  },
});
