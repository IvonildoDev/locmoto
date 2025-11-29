import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/Colors';
import { Reservation } from '../types';
import { Button } from './Button';

interface ReservationCardProps {
  reservation: Reservation;
  onExtend?: () => void;
  onSupport?: () => void;
}

export function ReservationCard({ reservation, onExtend, onSupport }: ReservationCardProps) {
  const { motorcycle, pickupDate, returnDate, totalDays } = reservation;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', '');
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: motorcycle.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.modelName}>{motorcycle.brand} {motorcycle.model}</Text>
            {motorcycle.plate && (
              <Text style={styles.plate}>Placa {motorcycle.plate}</Text>
            )}
          </View>
          <View style={styles.daysContainer}>
            <Text style={styles.daysNumber}>{totalDays}</Text>
            <Text style={styles.daysLabel}>DIAS</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.dates}>
          <Text style={styles.dateLabel}>
            <Text style={styles.dateBold}>Retirada: </Text>
            {formatDate(pickupDate)}
          </Text>
          <Text style={styles.dateLabel}>
            <Text style={styles.dateBold}>Devolução: </Text>
            {formatDate(returnDate)}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button 
            title="Prorrogar Aluguel" 
            onPress={onExtend || (() => {})} 
            variant="primary"
            size="medium"
            style={styles.extendButton}
          />
          <Button 
            title="Suporte 24h" 
            onPress={onSupport || (() => {})} 
            variant="secondary"
            size="medium"
            style={styles.supportButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  plate: {
    fontSize: 14,
    color: Colors.shared.primary,
    marginTop: 4,
  },
  daysContainer: {
    backgroundColor: Colors.shared.brown,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  daysLabel: {
    fontSize: 10,
    color: '#FFF',
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 16,
  },
  dates: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginBottom: 4,
  },
  dateBold: {
    fontWeight: '600',
    color: '#FFF',
  },
  actions: {
    gap: 8,
  },
  extendButton: {
    width: '100%',
  },
  supportButton: {
    width: '100%',
  },
});
