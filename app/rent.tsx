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
import { MotoCard } from '../components/MotoCard';
import Colors from '../constants/Colors';
import { useMotos } from '../context/MotosContext';

export default function RentScreen() {
  const { motos } = useMotos();
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

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

      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Motos List */}
        <View style={styles.listContainer}>
          {motos.map((moto) => (
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
