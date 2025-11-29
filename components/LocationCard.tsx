import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { Location } from '../types';

interface LocationCardProps {
  location: Location;
  onPress: () => void;
}

export function LocationCard({ location, onPress }: LocationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: location.type === 'store' ? Colors.shared.primary : Colors.shared.brown }]}>
        <Ionicons 
          name={location.type === 'store' ? 'bicycle' : 'storefront'} 
          size={24} 
          color="#FFF" 
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{location.name}</Text>
        <Text style={styles.address}>{location.address}</Text>
        <Text style={styles.distance}>{location.distance} - {location.hours}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.shared.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  address: {
    fontSize: 13,
    color: Colors.shared.gray,
    marginTop: 2,
  },
  distance: {
    fontSize: 12,
    color: Colors.shared.primary,
    marginTop: 4,
  },
});
