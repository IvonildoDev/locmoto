import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { MotoCard } from '../components/MotoCard';
import Colors from '../constants/Colors';
import { useMotos } from '../context/MotosContext';

// Filtros de motos
const motorcycleFilters = [
  { id: 'all', label: 'Todas' },
  { id: 'sport', label: 'Esportiva' },
  { id: 'naked', label: 'Naked' },
  { id: 'scooter', label: 'Scooter' },
  { id: 'custom', label: 'Custom' },
  { id: 'trail', label: 'Trail' },
];

export default function RentScreen() {
  const { motos } = useMotos();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

  const filteredMotos = selectedFilter === 'all' 
    ? motos 
    : motos.filter(m => m.model.toLowerCase().includes(selectedFilter.toLowerCase()));

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alugar Motocicleta</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Period Selection */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Escolha o Período</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Retirada</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={18} color={Colors.shared.primary} />
                <Text style={styles.dateText}>{formatDateTime(pickupDate)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Devolução</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={18} color={Colors.shared.primary} />
                <Text style={styles.dateText}>{formatDateTime(returnDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Qual modelo você procura?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {motorcycleFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Motos List */}
        <View style={styles.listContainer}>
          {filteredMotos.map((moto) => (
            <MotoCard
              key={moto.id}
              moto={moto}
              variant="horizontal"
              onPress={() => router.push({
                pathname: '/moto-details',
                params: { id: moto.id }
              })}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Verificar Disponibilidade"
          onPress={() => {}}
          variant="primary"
          size="large"
          style={styles.checkButton}
        />
      </View>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 32,
  },
  periodSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shared.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 13,
    color: '#FFF',
    marginLeft: 8,
  },
  filterSection: {
    backgroundColor: Colors.shared.darkBg,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  filtersContent: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.shared.cardBg,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.shared.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.shared.darkBg,
    borderTopWidth: 1,
    borderTopColor: Colors.shared.cardBg,
  },
  checkButton: {
    width: '100%',
  },
});
