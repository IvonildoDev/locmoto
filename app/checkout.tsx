import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import Colors from '../constants/Colors';
import { useMotos } from '../context/MotosContext';

type PaymentOption = 'partial' | 'full';
type PaymentMethod = 'dinheiro' | 'debito' | 'credito' | 'pix';

export default function CheckoutScreen() {
  const { motorcycleId, pickupDate, returnDate } = useLocalSearchParams<{
    motorcycleId: string;
    pickupDate: string;
    returnDate: string;
  }>();

  const { motos } = useMotos();
  const moto = motos.find(m => m.id === motorcycleId) || motos[0];
  const pickup = pickupDate ? new Date(pickupDate) : new Date();
  const returnD = returnDate ? new Date(returnDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  // Se não houver moto, mostrar tela de erro
  if (!moto) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
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

  const totalDays = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
  const total = moto.dailyRate * totalDays;

  const [paymentOption, setPaymentOption] = useState<PaymentOption>('partial');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisar e Pagar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Reservation Summary */}
        <Text style={styles.sectionTitle}>Resumo da sua Reserva</Text>
        <View style={styles.reservationCard}>
          <Image source={{ uri: moto.imageUrl }} style={styles.motoImage} />
          <View style={styles.motoInfo}>
            <Text style={styles.motoName}>{moto.brand} {moto.model}</Text>
            <Text style={styles.dateInfo}>Retirada: {formatDate(pickup)} - LocMoto Pilar</Text>
            <Text style={styles.dateInfo}>Devolução: {formatDate(returnD)} - LocMoto Pilar</Text>
          </View>
        </View>

        {/* Pricing Breakdown */}
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Diária</Text>
            <Text style={styles.priceValue}>{formatCurrency(moto.dailyRate)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Quantidade de dias</Text>
            <Text style={styles.priceValue}>{totalDays} {totalDays === 1 ? 'dia' : 'dias'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Valor Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Payment Option */}
        <Text style={styles.sectionTitle}>Opção de Pagamento</Text>
        <View style={styles.paymentOptionContainer}>
          <TouchableOpacity
            style={[styles.paymentOptionButton, paymentOption === 'partial' && styles.paymentOptionActive]}
            onPress={() => setPaymentOption('partial')}
          >
            <Text style={[styles.paymentOptionText, paymentOption === 'partial' && styles.paymentOptionTextActive]}>
              Pagar 50% agora
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOptionButton, paymentOption === 'full' && styles.paymentOptionActive]}
            onPress={() => setPaymentOption('full')}
          >
            <Text style={[styles.paymentOptionText, paymentOption === 'full' && styles.paymentOptionTextActive]}>
              Pagar valor total
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        
        {/* Dinheiro */}
        <TouchableOpacity
          style={[styles.paymentMethodCard, paymentMethod === 'dinheiro' && styles.paymentMethodActive]}
          onPress={() => setPaymentMethod('dinheiro')}
        >
          <View style={styles.paymentMethodHeader}>
            <View style={styles.paymentMethodLeft}>
              <Ionicons name="cash-outline" size={24} color={Colors.shared.primary} />
              <Text style={styles.paymentMethodTitle}>Dinheiro</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'dinheiro' && styles.radioActive]}>
              {paymentMethod === 'dinheiro' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Cartão de Débito */}
        <TouchableOpacity
          style={[styles.paymentMethodCard, paymentMethod === 'debito' && styles.paymentMethodActive]}
          onPress={() => setPaymentMethod('debito')}
        >
          <View style={styles.paymentMethodHeader}>
            <View style={styles.paymentMethodLeft}>
              <Ionicons name="card-outline" size={24} color={Colors.shared.primary} />
              <Text style={styles.paymentMethodTitle}>Cartão de Débito</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'debito' && styles.radioActive]}>
              {paymentMethod === 'debito' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Cartão de Crédito */}
        <TouchableOpacity
          style={[styles.paymentMethodCard, paymentMethod === 'credito' && styles.paymentMethodActive]}
          onPress={() => setPaymentMethod('credito')}
        >
          <View style={styles.paymentMethodHeader}>
            <View style={styles.paymentMethodLeft}>
              <Ionicons name="card" size={24} color={Colors.shared.primary} />
              <Text style={styles.paymentMethodTitle}>Cartão de Crédito</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'credito' && styles.radioActive]}>
              {paymentMethod === 'credito' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* PIX */}
        <TouchableOpacity
          style={[styles.paymentMethodCard, paymentMethod === 'pix' && styles.paymentMethodActive]}
          onPress={() => setPaymentMethod('pix')}
        >
          <View style={styles.paymentMethodHeader}>
            <View style={styles.paymentMethodLeft}>
              <Ionicons name="qr-code-outline" size={24} color={Colors.shared.primary} />
              <Text style={styles.paymentMethodTitle}>PIX</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'pix' && styles.radioActive]}>
              {paymentMethod === 'pix' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Ao continuar, você concorda com nossos <Text style={styles.termsLink}>Termos e Condições</Text>.
        </Text>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Confirmar Pagamento"
          onPress={() => {
            // Process payment and navigate to home
            router.replace('/(tabs)');
          }}
          variant="primary"
          size="large"
          style={styles.confirmButton}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 16,
  },
  reservationCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  motoImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
  },
  motoInfo: {
    padding: 16,
  },
  motoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  dateInfo: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginBottom: 4,
  },
  pricingCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.shared.gray,
  },
  priceValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 12,
    borderStyle: 'dashed',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  paymentOptionContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 4,
  },
  paymentOptionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentOptionActive: {
    backgroundColor: Colors.shared.primary,
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.shared.gray,
  },
  paymentOptionTextActive: {
    color: '#FFF',
  },
  paymentMethodCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodActive: {
    borderColor: Colors.shared.primary,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodTitle: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.shared.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.shared.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.shared.primary,
  },
  termsText: {
    fontSize: 14,
    color: Colors.shared.gray,
    textAlign: 'center',
    marginVertical: 24,
    marginBottom: 120,
  },
  termsLink: {
    color: Colors.shared.primary,
    textDecorationLine: 'underline',
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
  confirmButton: {
    width: '100%',
  },
});
