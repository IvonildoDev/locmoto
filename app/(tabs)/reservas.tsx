import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReservationCard } from '../../components/ReservationCard';
import Colors from '../../constants/Colors';
import { useMotos } from '../../context/MotosContext';

type TabType = 'active' | 'history';

export default function ReservasScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { motos, alugueisAtivos } = useMotos();

  // Converter aluguéis ativos para o formato de reserva
  const reservations = useMemo(() => {
    return Object.entries(alugueisAtivos).map(([motoId, aluguel]) => {
      const moto = motos.find(m => m.id === motoId);
      return {
        id: `reserva-${motoId}`,
        motorcycle: {
          id: motoId,
          brand: moto?.brand || 'Marca',
          model: moto?.model || 'Modelo',
          imageUrl: moto?.imageUrl || '',
          year: moto?.year || 2024,
          specs: moto?.specs || { cc: 0, transmission: '', consumption: '', brakes: '' },
        },
        pickupDate: aluguel.dataInicio,
        returnDate: aluguel.dataFim,
        pickupLocation: 'LocMoto Pilar',
        status: 'active' as const,
        totalPrice: aluguel.valorTotal,
      };
    });
  }, [alugueisAtivos, motos]);

  const activeReservations = reservations.filter(r => r.status === 'active');
  const historyReservations = reservations.filter(r => r.status !== 'active');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Reservas</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Ativas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'active' ? (
          activeReservations.length > 0 ? (
            activeReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onExtend={() => console.log('Extend rental')}
                onSupport={() => console.log('24h support')}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={Colors.shared.gray} />
              <Text style={styles.emptyTitle}>Nenhuma reserva ativa</Text>
              <Text style={styles.emptySubtitle}>Suas reservas ativas aparecerão aqui</Text>
            </View>
          )
        ) : (
          historyReservations.length > 0 ? (
            historyReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color={Colors.shared.gray} />
              <Text style={styles.emptyTitle}>Nenhum histórico</Text>
              <Text style={styles.emptySubtitle}>Seu histórico de aluguéis aparecerá aqui</Text>
            </View>
          )
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.shared.gray,
  },
  tabText: {
    fontSize: 16,
    color: Colors.shared.gray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 8,
  },
});
