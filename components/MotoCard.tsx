import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { Motorcycle } from '../types';

interface MotoCardProps {
  moto: Motorcycle;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
}

const { width } = Dimensions.get('window');

export function MotoCard({ moto, onPress, variant = 'vertical' }: MotoCardProps) {
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: moto.imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalContent}>
          <Text style={styles.modelName}>{moto.brand} {moto.model}</Text>
          <Text style={styles.specs}>{moto.specs.cc}cc, {moto.specs.transmission}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>R$ {moto.dailyRate.toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.priceLabel}>/dia</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.verticalCard} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: moto.imageUrl }} style={styles.verticalImage} />
      <View style={styles.verticalContent}>
        <View>
          <Text style={styles.brand}>{moto.brand}</Text>
          <Text style={styles.modelName}>{moto.model}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.rating}>{moto.rating}</Text>
            <Text style={styles.reviewCount}>({moto.reviewCount} avaliações)</Text>
          </View>
        </View>
        <View style={styles.priceContainerVertical}>
          <Text style={styles.priceVertical}>R$ {moto.dailyRate.toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.priceLabelVertical}>/dia</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  horizontalCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  horizontalImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
  },
  horizontalContent: {
    padding: 16,
    paddingBottom: 8,
  },
  modelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  specs: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginLeft: 4,
  },
  verticalCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    marginRight: 16,
    width: width * 0.7,
    overflow: 'hidden',
  },
  verticalImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
  },
  verticalContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 12,
    color: Colors.shared.gray,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingStar: {
    color: '#FFD700',
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginLeft: 4,
  },
  priceContainerVertical: {
    alignItems: 'flex-end',
  },
  priceVertical: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  priceLabelVertical: {
    fontSize: 12,
    color: Colors.shared.gray,
  },
});
