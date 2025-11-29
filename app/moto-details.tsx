import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import Colors from '../constants/Colors';
import { useMotos } from '../context/MotosContext';

const { width } = Dimensions.get('window');

export default function MotoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { motos } = useMotos();
  const moto = motos.find(m => m.id === id);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [kmType, setKmType] = useState<'free' | 'limited'>('free');
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000));
  
  // Estados para os modais de data
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingDateType, setEditingDateType] = useState<'pickup' | 'return'>('pickup');
  const [tempDateInput, setTempDateInput] = useState('');

  // Se não encontrar a moto, mostrar mensagem
  if (!moto) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Moto</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.shared.gray} />
          <Text style={{ color: Colors.shared.gray, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
            Moto não encontrada
          </Text>
          <Button
            title="Voltar"
            onPress={() => router.back()}
            variant="primary"
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const totalDays = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = moto.dailyRate * totalDays;

  const images = moto.images || [moto.imageUrl];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace('.', '');
  };

  const specs = [
    { icon: 'speedometer-outline', label: 'Consumo', value: moto.specs.consumption },
    { icon: 'cog-outline', label: 'Cilindrada', value: `${moto.specs.cc} cc` },
    { icon: 'disc-outline', label: 'Freio', value: moto.specs.brakes },
    { icon: 'calendar-outline', label: 'Ano', value: moto.year.toString() },
  ];

  // Formatar data para input (DD/MM/AAAA)
  const formatDateForInput = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Aplicar máscara de data
  const applyDateMask = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    let masked = '';
    if (numbers.length > 0) masked += numbers.substring(0, 2);
    if (numbers.length > 2) masked += '/' + numbers.substring(2, 4);
    if (numbers.length > 4) masked += '/' + numbers.substring(4, 8);
    return masked;
  };

  // Validar e converter string para Date
  const parseDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2024) return null;
    const date = new Date(year, month, day);
    if (date.getDate() !== day) return null; // Valida dia inválido do mês
    return date;
  };

  // Abrir modal para editar data
  const openDateModal = (type: 'pickup' | 'return') => {
    setEditingDateType(type);
    setTempDateInput(formatDateForInput(type === 'pickup' ? pickupDate : returnDate));
    setShowDateModal(true);
  };

  // Confirmar data
  const confirmDate = () => {
    const newDate = parseDate(tempDateInput);
    if (!newDate) {
      Alert.alert('Data Inválida', 'Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (editingDateType === 'pickup') {
      if (newDate < today) {
        Alert.alert('Data Inválida', 'A data de retirada não pode ser anterior a hoje.');
        return;
      }
      setPickupDate(newDate);
      // Ajustar data de devolução se necessário
      if (newDate >= returnDate) {
        const newReturnDate = new Date(newDate);
        newReturnDate.setDate(newReturnDate.getDate() + 1);
        setReturnDate(newReturnDate);
      }
    } else {
      if (newDate <= pickupDate) {
        Alert.alert('Data Inválida', 'A data de devolução deve ser posterior à data de retirada.');
        return;
      }
      setReturnDate(newDate);
    }
    setShowDateModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Moto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.carouselImage} />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentImageIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Moto Info */}
          <Text style={styles.brand}>{moto.brand}</Text>
          <Text style={styles.model}>{moto.model}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.rating}>{moto.rating}</Text>
            <Text style={styles.reviewCount}>({moto.reviewCount} avaliações)</Text>
          </View>

          {/* Date Selection */}
          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Data de Retirada</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => openDateModal('pickup')}
              >
                <Ionicons name="calendar-outline" size={18} color={Colors.shared.primary} />
                <Text style={styles.dateText}>{formatDate(pickupDate)}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.shared.gray} />
              </TouchableOpacity>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Data de Devolução</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => openDateModal('return')}
              >
                <Ionicons name="calendar-outline" size={18} color={Colors.shared.primary} />
                <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.shared.gray} />
              </TouchableOpacity>
            </View>
          </View>

          {/* KM Type */}
          <View style={styles.kmContainer}>
            <TouchableOpacity
              style={[styles.kmOption, kmType === 'free' && styles.kmOptionActive]}
              onPress={() => setKmType('free')}
            >
              <Text style={[styles.kmText, kmType === 'free' && styles.kmTextActive]}>KM Livre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.kmOption, kmType === 'limited' && styles.kmOptionActive]}
              onPress={() => setKmType('limited')}
            >
              <Text style={[styles.kmText, kmType === 'limited' && styles.kmTextActive]}>KM Limitada</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Preço Total</Text>
            <Text style={styles.price}>R$ {totalPrice.toFixed(2).replace('.', ',')}</Text>
          </View>

          {/* Specifications */}
          <Text style={styles.sectionTitle}>Especificações</Text>
          <View style={styles.specsGrid}>
            {specs.map((spec, index) => (
              <View key={index} style={styles.specItem}>
                <Ionicons name={spec.icon as any} size={24} color={Colors.shared.primary} />
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Edição de Data */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Text style={styles.datePickerCancel}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>
                {editingDateType === 'pickup' ? 'Data de Retirada' : 'Data de Devolução'}
              </Text>
              <TouchableOpacity onPress={confirmDate}>
                <Text style={styles.datePickerConfirm}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInputContainer}>
              <Ionicons name="calendar-outline" size={24} color={Colors.shared.primary} />
              <TextInput
                style={styles.dateInput}
                value={tempDateInput}
                onChangeText={(text) => setTempDateInput(applyDateMask(text))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Colors.shared.gray}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <Text style={styles.dateHint}>Digite a data no formato DD/MM/AAAA</Text>
          </View>
        </View>
      </Modal>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Alugar Agora"
          onPress={() => router.push({
            pathname: '/checkout',
            params: { 
              motorcycleId: moto.id,
              pickupDate: pickupDate.toISOString(),
              returnDate: returnDate.toISOString(),
            }
          })}
          variant="primary"
          size="large"
          style={styles.rentButton}
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
  carouselContainer: {
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 250,
    backgroundColor: '#F5F5F5',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 24,
  },
  content: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: Colors.shared.gray,
  },
  model: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: Colors.shared.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.shared.darkBg,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  datePickerCancel: {
    fontSize: 16,
    color: Colors.shared.gray,
  },
  datePickerConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.shared.primary,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shared.darkBg,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  dateHint: {
    textAlign: 'center',
    color: Colors.shared.gray,
    fontSize: 14,
    marginBottom: 20,
  },
  kmContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  kmOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  kmOptionActive: {
    backgroundColor: '#FFF',
  },
  kmText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.shared.gray,
  },
  kmTextActive: {
    color: Colors.shared.darkBg,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.shared.gray,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  specItem: {
    width: '47%',
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  specLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginTop: 8,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 50,
    backgroundColor: Colors.shared.darkBg,
    borderTopWidth: 1,
    borderTopColor: Colors.shared.cardBg,
  },
  rentButton: {
    width: '100%',
  },
});
