import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { Button } from '../../components/Button';
import Colors from '../../constants/Colors';
import { useClientes } from '../../context/ClientesContext';
import { useMotos } from '../../context/MotosContext';
import { ClienteDB } from '../../database/database';
import { Motorcycle } from '../../types';

// Interface para dados do cliente
interface ClienteAluguel {
  id?: number;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  endereco: string;
}

// Interface para dados do aluguel
interface DadosAluguel {
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  cliente: ClienteAluguel | null;
}

export default function MotosScreen() {
  const { motos, setMotos, addMoto, updateMoto, toggleAvailability, alugueisAtivos, setAlugueisAtivos, registrarAluguel } = useMotos();
  const { searchClientes } = useClientes();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState<Motorcycle | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'aluguel'>('edit');
  
  // Modal de busca de clientes
  const [searchClienteModalVisible, setSearchClienteModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ClienteDB[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  
  // Campos de edição da moto
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDailyRate, setEditDailyRate] = useState('');
  const [editCc, setEditCc] = useState('');
  const [editImage, setEditImage] = useState('');

  // Campos para nova moto
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newDailyRate, setNewDailyRate] = useState('');
  const [newCc, setNewCc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newTransmission, setNewTransmission] = useState<'Manual' | 'Automática'>('Manual');
  const [newPlaca, setNewPlaca] = useState('');

  // Campos de aluguel
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Dados do cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteCpf, setClienteCpf] = useState('');
  const [clienteCnh, setClienteCnh] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEndereco, setClienteEndereco] = useState('');
  const [clienteAssociado, setClienteAssociado] = useState(false);

  // Efeito para buscar clientes quando digita 3+ letras
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const results = searchClientes(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Função para selecionar cliente da busca
  const handleSelectCliente = (cliente: ClienteDB) => {
    setClienteNome(cliente.nome);
    setClienteCpf(cliente.cpf);
    setClienteCnh(cliente.cnh || '');
    setClienteTelefone(cliente.telefone || '');
    // Montar endereço completo a partir dos campos separados
    const enderecoPartes = [
      cliente.rua,
      cliente.numero,
      cliente.complemento,
      cliente.bairro,
      cliente.cidade,
      cliente.estado,
      cliente.cep
    ].filter(Boolean);
    setClienteEndereco(enderecoPartes.join(', '));
    setSelectedClienteId(cliente.id || null);
    setClienteAssociado(true);
    setSearchClienteModalVisible(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Função para abrir modal de busca
  const handleOpenSearchCliente = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchClienteModalVisible(true);
  };

  // Máscaras
  const formatCpf = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted = cleaned.substring(0, 3);
    if (cleaned.length > 3) formatted += '.' + cleaned.substring(3, 6);
    if (cleaned.length > 6) formatted += '.' + cleaned.substring(6, 9);
    if (cleaned.length > 9) formatted += '-' + cleaned.substring(9, 11);
    return formatted;
  };

  const formatPlaca = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted = cleaned.substring(0, 3);
    if (cleaned.length > 3) formatted += '-' + cleaned.substring(3, 7);
    return formatted;
  };

  const handlePlacaChange = (text: string) => {
    const formatted = formatPlaca(text);
    setNewPlaca(formatted);
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted = '(' + cleaned.substring(0, 2);
    if (cleaned.length > 2) formatted += ') ' + cleaned.substring(2, 3);
    if (cleaned.length > 3) formatted += cleaned.substring(3, 7);
    if (cleaned.length > 7) formatted += '-' + cleaned.substring(7, 11);
    return formatted;
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted = cleaned.substring(0, 2);
    if (cleaned.length > 2) formatted += '/' + cleaned.substring(2, 4);
    if (cleaned.length > 4) formatted += '/' + cleaned.substring(4, 8);
    return formatted;
  };

  const handleEditMoto = (moto: Motorcycle) => {
    setSelectedMoto(moto);
    setEditBrand(moto.brand);
    setEditModel(moto.model);
    setEditYear(moto.year.toString());
    setEditDailyRate(moto.dailyRate.toString());
    setEditCc(moto.specs.cc.toString());
    setEditImage(moto.imageUrl);
    
    // Carregar dados de aluguel se existir
    const aluguel = alugueisAtivos[moto.id];
    if (aluguel) {
      setDataInicio(aluguel.dataInicio);
      setDataFim(aluguel.dataFim);
      if (aluguel.cliente) {
        setClienteNome(aluguel.cliente.nome);
        setClienteCpf(aluguel.cliente.cpf);
        setClienteCnh(aluguel.cliente.cnh);
        setClienteTelefone(aluguel.cliente.telefone);
        setClienteEndereco(aluguel.cliente.endereco);
        setClienteAssociado(true);
      }
    } else {
      setDataInicio('');
      setDataFim('');
      setClienteNome('');
      setClienteCpf('');
      setClienteCnh('');
      setClienteTelefone('');
      setClienteEndereco('');
      setClienteAssociado(false);
    }
    
    setModalMode('edit');
    setEditModalVisible(true);
  };

  const handleOpenAluguel = (moto: Motorcycle) => {
    setSelectedMoto(moto);
    setEditBrand(moto.brand);
    setEditModel(moto.model);
    setEditYear(moto.year.toString());
    setEditDailyRate(moto.dailyRate.toString());
    
    const aluguel = alugueisAtivos[moto.id];
    if (aluguel) {
      setDataInicio(aluguel.dataInicio);
      setDataFim(aluguel.dataFim);
      if (aluguel.cliente) {
        setClienteNome(aluguel.cliente.nome);
        setClienteCpf(aluguel.cliente.cpf);
        setClienteCnh(aluguel.cliente.cnh);
        setClienteTelefone(aluguel.cliente.telefone);
        setClienteEndereco(aluguel.cliente.endereco);
        setClienteAssociado(true);
      }
    } else {
      setDataInicio('');
      setDataFim('');
      setClienteNome('');
      setClienteCpf('');
      setClienteCnh('');
      setClienteTelefone('');
      setClienteEndereco('');
      setClienteAssociado(false);
    }
    
    setModalMode('aluguel');
    setEditModalVisible(true);
  };

  const pickImage = async (isNew = false) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (isNew) {
        setNewImage(result.assets[0].uri);
      } else {
        setEditImage(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async (isNew = false) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (isNew) {
        setNewImage(result.assets[0].uri);
      } else {
        setEditImage(result.assets[0].uri);
      }
    }
  };

  const handleSaveEdit = () => {
    if (!selectedMoto) return;

    if (!editBrand.trim() || !editModel.trim() || !editYear.trim() || !editDailyRate.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Atualizar usando o contexto (persiste no banco)
    updateMoto(selectedMoto.id, {
      brand: editBrand,
      model: editModel,
      year: parseInt(editYear),
      dailyRate: parseFloat(editDailyRate),
      imageUrl: editImage,
      specs: {
        ...selectedMoto.specs,
        cc: parseInt(editCc) || selectedMoto.specs.cc,
      },
    });

    setEditModalVisible(false);
    Alert.alert('Sucesso', 'Moto atualizada com sucesso!');
  };

  const handleAddMoto = () => {
    if (!newBrand.trim() || !newModel.trim() || !newYear.trim() || !newDailyRate.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const newMoto: Motorcycle = {
      id: Date.now().toString(),
      brand: newBrand,
      model: newModel,
      year: parseInt(newYear),
      plate: newPlaca || undefined,
      dailyRate: parseFloat(newDailyRate),
      imageUrl: newImage || 'https://via.placeholder.com/400x200?text=Moto',
      specs: {
        cc: parseInt(newCc) || 160,
        transmission: newTransmission,
        consumption: '35 km/l',
        brakes: 'CBS',
      },
      rating: 0,
      reviewCount: 0,
      description: `${newBrand} ${newModel} ${newYear}`,
      available: true,
    };

    addMoto(newMoto);
    setAddModalVisible(false);
    resetNewMotoFields();
    Alert.alert('Sucesso', 'Moto adicionada com sucesso!');
  };

  const resetNewMotoFields = () => {
    setNewBrand('');
    setNewModel('');
    setNewYear('');
    setNewDailyRate('');
    setNewCc('');
    setNewImage('');
    setNewTransmission('Manual');
    setNewPlaca('');
  };

  const handleToggleAvailability = (motoId: string) => {
    toggleAvailability(motoId);
  };

  const calcularDias = () => {
    if (!dataInicio || !dataFim) return 0;
    const [diaI, mesI, anoI] = dataInicio.split('/').map(Number);
    const [diaF, mesF, anoF] = dataFim.split('/').map(Number);
    const inicio = new Date(anoI, mesI - 1, diaI);
    const fim = new Date(anoF, mesF - 1, diaF);
    const diff = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const calcularValorTotal = () => {
    if (!selectedMoto) return 0;
    const dias = calcularDias();
    return dias * selectedMoto.dailyRate;
  };

  const handleAssociarCliente = () => {
    if (!clienteNome.trim() || !clienteCpf.trim() || !clienteCnh.trim() || !clienteTelefone.trim()) {
      Alert.alert('Atenção', 'Preencha todos os dados do cliente.');
      return;
    }
    setClienteAssociado(true);
    Alert.alert('Sucesso', 'Cliente associado à moto!');
  };

  const gerarContratoPDF = async () => {
    if (!selectedMoto || !clienteAssociado) {
      Alert.alert('Atenção', 'Associe um cliente antes de gerar o contrato.');
      return;
    }

    if (!dataInicio || !dataFim) {
      Alert.alert('Atenção', 'Preencha as datas do aluguel.');
      return;
    }

    const dias = calcularDias();
    const valorTotal = calcularValorTotal();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contrato de Locação - LocMoto</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #E67E22;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #E67E22;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .contract-title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin: 30px 0;
              text-transform: uppercase;
            }
            .section {
              margin-bottom: 25px;
            }
            .section h3 {
              color: #8B5A2B;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              width: 180px;
              color: #555;
            }
            .info-value {
              flex: 1;
            }
            .terms {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .terms h4 {
              margin-top: 0;
              color: #E67E22;
            }
            .terms ol {
              padding-left: 20px;
            }
            .terms li {
              margin-bottom: 10px;
            }
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 45%;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              padding-top: 10px;
              margin-top: 60px;
            }
            .total-box {
              background: #E67E22;
              color: white;
              padding: 15px 25px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .total-box .value {
              font-size: 28px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LocMoto</h1>
            <p>Aluguel de Motocicletas</p>
            <p>Rua 7 de Maio, Chã do Pilar - Pilar, AL</p>
          </div>

          <div class="contract-title">Contrato de Locação de Motocicleta</div>

          <div class="section">
            <h3>Dados do Locatário</h3>
            <div class="info-row">
              <span class="info-label">Nome Completo:</span>
              <span class="info-value">${clienteNome}</span>
            </div>
            <div class="info-row">
              <span class="info-label">CPF:</span>
              <span class="info-value">${clienteCpf}</span>
            </div>
            <div class="info-row">
              <span class="info-label">CNH:</span>
              <span class="info-value">${clienteCnh}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Telefone:</span>
              <span class="info-value">${clienteTelefone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Endereço:</span>
              <span class="info-value">${clienteEndereco}</span>
            </div>
          </div>

          <div class="section">
            <h3>Dados da Motocicleta</h3>
            <div class="info-row">
              <span class="info-label">Modelo:</span>
              <span class="info-value">${selectedMoto.brand} ${selectedMoto.model}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ano:</span>
              <span class="info-value">${selectedMoto.year}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cilindrada:</span>
              <span class="info-value">${selectedMoto.specs.cc}cc</span>
            </div>
            <div class="info-row">
              <span class="info-label">Placa:</span>
              <span class="info-value">${selectedMoto.plate || 'A definir'}</span>
            </div>
          </div>

          <div class="section">
            <h3>Período da Locação</h3>
            <div class="info-row">
              <span class="info-label">Data de Início:</span>
              <span class="info-value">${dataInicio}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data de Devolução:</span>
              <span class="info-value">${dataFim}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total de Dias:</span>
              <span class="info-value">${dias} dia(s)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Valor da Diária:</span>
              <span class="info-value">R$ ${selectedMoto.dailyRate.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div class="total-box">
            <div>VALOR TOTAL</div>
            <div class="value">R$ ${valorTotal.toFixed(2).replace('.', ',')}</div>
          </div>

          <div class="terms">
            <h4>Termos e Condições</h4>
            <ol>
              <li>O LOCATÁRIO declara ter verificado o estado da motocicleta, recebendo-a em perfeitas condições de uso.</li>
              <li>O LOCATÁRIO se compromete a devolver a motocicleta na data acordada, nas mesmas condições em que a recebeu.</li>
              <li>Qualquer dano causado à motocicleta durante o período de locação será de responsabilidade do LOCATÁRIO.</li>
              <li>É proibido o uso da motocicleta para fins ilícitos ou competições.</li>
              <li>O LOCATÁRIO é responsável por todas as multas de trânsito durante o período de locação.</li>
              <li>A motocicleta deve ser devolvida com o mesmo nível de combustível em que foi entregue.</li>
              <li>Em caso de atraso na devolução, será cobrada diária adicional.</li>
              <li>O LOCATÁRIO declara possuir CNH válida categoria A ou superior.</li>
            </ol>
          </div>

          <p style="text-align: center;">
            Pilar/AL, ${dataAtual}
          </p>

          <div class="signature-section">
            <div class="signature-box">
              <p style="margin-bottom: 5px; font-weight: bold;">LOCADORA:</p>
              <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
              <p style="margin: 0; font-size: 14px;"><strong>LocMoto</strong></p>
              <p style="margin: 0; font-size: 12px; color: #666;">Representante Legal</p>
              <p style="margin-top: 10px; font-size: 11px; color: #888;">CPF: ___.___.___-__</p>
            </div>
            <div class="signature-box">
              <p style="margin-bottom: 5px; font-weight: bold;">LOCATÁRIO:</p>
              <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
              <p style="margin: 0; font-size: 14px;"><strong>${clienteNome}</strong></p>
              <p style="margin: 0; font-size: 12px; color: #666;">CPF: ${clienteCpf}</p>
              <p style="margin-top: 10px; font-size: 11px; color: #888;">CNH: ${clienteCnh}</p>
            </div>
          </div>

          <div style="margin-top: 40px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; text-align: center; color: #666;">
              <strong>DECLARAÇÃO:</strong> Declaro ter lido e estar de acordo com todas as cláusulas deste contrato.
            </p>
          </div>

          <div class="footer">
            <p>LocMoto - Aluguel de Motocicletas</p>
            <p>Contrato gerado em ${dataAtual}</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Contrato de Locação - LocMoto',
          UTI: 'com.adobe.pdf',
        });
      }

      // Salvar aluguel no banco de dados
      if (selectedClienteId) {
        registrarAluguel(selectedMoto.id, selectedClienteId, {
          dataInicio,
          dataFim,
          valorTotal,
          cliente: {
            nome: clienteNome,
            cpf: clienteCpf,
            cnh: clienteCnh,
            telefone: clienteTelefone,
            endereco: clienteEndereco,
          },
        });
      } else {
        // Fallback se não tiver cliente no banco (apenas estado local)
        setAlugueisAtivos({
          ...alugueisAtivos,
          [selectedMoto.id]: {
            dataInicio,
            dataFim,
            valorTotal,
            cliente: {
              nome: clienteNome,
              cpf: clienteCpf,
              cnh: clienteCnh,
              telefone: clienteTelefone,
              endereco: clienteEndereco,
            },
          },
        });

        // Marcar moto como locada
        updateMoto(selectedMoto.id, { available: false });
      }

      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Contrato gerado e aluguel registrado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o contrato.');
    }
  };

  const renderMotoCard = ({ item }: { item: Motorcycle }) => (
    <View style={styles.motoCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleOpenAluguel(item)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.motoImage} />
      </TouchableOpacity>
      
      <View style={styles.motoContent}>
        <View style={styles.motoInfo}>
          <Text style={styles.motoName}>{item.brand} {item.model}</Text>
          <Text style={styles.motoSpecs}>{item.specs.cc}cc • {item.specs.transmission}</Text>
          <Text style={styles.motoPrice}>R$ {item.dailyRate.toFixed(2).replace('.', ',')}/dia</Text>
        </View>
        
        <View style={styles.motoActions}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.available ? styles.statusDisponivel : styles.statusLocada
            ]}
            onPress={() => handleToggleAvailability(item.id)}
          >
            <View style={[
              styles.statusDot,
              { backgroundColor: item.available ? '#27ae60' : '#e74c3c' }
            ]} />
            <Text style={styles.statusText}>
              {item.available ? 'Disponível' : 'Locada'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditMoto(item)}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Motos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Motos List */}
      <FlatList
        data={motos}
        keyExtractor={(item) => item.id}
        renderItem={renderMotoCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de Edição/Aluguel */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'edit' ? 'Editar Moto' : 'Alugar Moto'}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {modalMode === 'edit' ? (
                <>
                  {/* Imagem */}
                  <Text style={styles.inputLabel}>Foto da Moto</Text>
                  {editImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: editImage }} style={styles.imagePreview} />
                      <TouchableOpacity 
                        style={styles.changeImageButton}
                        onPress={() => pickImage(false)}
                      >
                        <Ionicons name="camera" size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadContainer}>
                      <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(false)}>
                        <Ionicons name="image-outline" size={32} color={Colors.shared.primary} />
                        <Text style={styles.uploadText}>Galeria</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto(false)}>
                        <Ionicons name="camera-outline" size={32} color={Colors.shared.primary} />
                        <Text style={styles.uploadText}>Câmera</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Campos da Moto */}
                  <Text style={styles.inputLabel}>Marca</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Honda, Yamaha"
                    placeholderTextColor={Colors.shared.gray}
                    value={editBrand}
                    onChangeText={setEditBrand}
                  />

                  <Text style={styles.inputLabel}>Modelo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: CG 160, MT-07"
                    placeholderTextColor={Colors.shared.gray}
                    value={editModel}
                    onChangeText={setEditModel}
                  />

                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Ano</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="2024"
                        placeholderTextColor={Colors.shared.gray}
                        value={editYear}
                        onChangeText={setEditYear}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Cilindrada (cc)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="160"
                        placeholderTextColor={Colors.shared.gray}
                        value={editCc}
                        onChangeText={setEditCc}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Valor da Diária (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100.00"
                    placeholderTextColor={Colors.shared.gray}
                    value={editDailyRate}
                    onChangeText={setEditDailyRate}
                    keyboardType="decimal-pad"
                  />

                  <Button
                    title="Salvar Alterações"
                    onPress={handleSaveEdit}
                    variant="primary"
                    size="large"
                    style={styles.saveButton}
                  />
                </>
              ) : (
                <>
                  {/* Info da Moto */}
                  <View style={styles.motoInfoCard}>
                    <Text style={styles.motoInfoTitle}>{selectedMoto?.brand} {selectedMoto?.model}</Text>
                    <Text style={styles.motoInfoSubtitle}>
                      {selectedMoto?.year} • {selectedMoto?.specs.cc}cc
                    </Text>
                    <Text style={styles.motoInfoPrice}>
                      R$ {selectedMoto?.dailyRate.toFixed(2).replace('.', ',')}/dia
                    </Text>
                  </View>

                  {/* Datas do Aluguel */}
                  <View style={styles.sectionHeader}>
                    <Ionicons name="calendar" size={20} color={Colors.shared.primary} />
                    <Text style={styles.sectionTitle}>Período do Aluguel</Text>
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Data Início</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="DD/MM/AAAA"
                        placeholderTextColor={Colors.shared.gray}
                        value={dataInicio}
                        onChangeText={(text) => setDataInicio(formatDate(text))}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Data Fim</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="DD/MM/AAAA"
                        placeholderTextColor={Colors.shared.gray}
                        value={dataFim}
                        onChangeText={(text) => setDataFim(formatDate(text))}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {dataInicio && dataFim && (
                    <View style={styles.totalCard}>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Dias:</Text>
                        <Text style={styles.totalValue}>{calcularDias()}</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Valor Total:</Text>
                        <Text style={styles.totalValueHighlight}>
                          R$ {calcularValorTotal().toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Dados do Cliente */}
                  <View style={styles.sectionHeader}>
                    <Ionicons name="person" size={20} color={Colors.shared.primary} />
                    <Text style={styles.sectionTitle}>Dados do Cliente</Text>
                  </View>

                  {/* Botão de buscar cliente */}
                  <TouchableOpacity 
                    style={styles.searchClienteButton}
                    onPress={handleOpenSearchCliente}
                  >
                    <Ionicons name="search" size={20} color={Colors.shared.primary} />
                    <Text style={styles.searchClienteButtonText}>Buscar Cliente Cadastrado</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Nome Completo</Text>
                  <TextInput
                    style={[styles.input, clienteAssociado && styles.inputDisabled]}
                    placeholder="Nome do cliente"
                    placeholderTextColor={Colors.shared.gray}
                    value={clienteNome}
                    onChangeText={setClienteNome}
                    editable={!clienteAssociado}
                  />

                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>CPF</Text>
                      <TextInput
                        style={[styles.input, clienteAssociado && styles.inputDisabled]}
                        placeholder="000.000.000-00"
                        placeholderTextColor={Colors.shared.gray}
                        value={clienteCpf}
                        onChangeText={(text) => setClienteCpf(formatCpf(text))}
                        keyboardType="numeric"
                        maxLength={14}
                        editable={!clienteAssociado}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>CNH</Text>
                      <TextInput
                        style={[styles.input, clienteAssociado && styles.inputDisabled]}
                        placeholder="Nº da CNH"
                        placeholderTextColor={Colors.shared.gray}
                        value={clienteCnh}
                        onChangeText={setClienteCnh}
                        keyboardType="numeric"
                        editable={!clienteAssociado}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={[styles.input, clienteAssociado && styles.inputDisabled]}
                    placeholder="(82) 99999-9999"
                    placeholderTextColor={Colors.shared.gray}
                    value={clienteTelefone}
                    onChangeText={(text) => setClienteTelefone(formatPhone(text))}
                    keyboardType="phone-pad"
                    maxLength={16}
                    editable={!clienteAssociado}
                  />

                  <Text style={styles.inputLabel}>Endereço</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline, clienteAssociado && styles.inputDisabled]}
                    placeholder="Endereço completo"
                    placeholderTextColor={Colors.shared.gray}
                    value={clienteEndereco}
                    onChangeText={setClienteEndereco}
                    multiline
                    numberOfLines={2}
                    editable={!clienteAssociado}
                  />

                  {!clienteAssociado ? (
                    <Button
                      title="Associar Cliente"
                      onPress={handleAssociarCliente}
                      variant="outline"
                      size="large"
                      icon={<Ionicons name="person-add" size={20} color={Colors.shared.primary} />}
                      style={styles.associarButton}
                    />
                  ) : (
                    <View style={styles.clienteAssociadoContainer}>
                      <View style={styles.clienteAssociadoCard}>
                        <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
                        <Text style={styles.clienteAssociadoText}>Cliente associado</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeClienteButton}
                        onPress={() => {
                          setClienteAssociado(false);
                          setClienteNome('');
                          setClienteCpf('');
                          setClienteCnh('');
                          setClienteTelefone('');
                          setClienteEndereco('');
                          setSelectedClienteId(null);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                        <Text style={styles.removeClienteText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <Button
                    title="Gerar Contrato PDF"
                    onPress={gerarContratoPDF}
                    variant="primary"
                    size="large"
                    icon={<Ionicons name="document-text" size={20} color="#FFF" />}
                    style={styles.saveButton}
                    disabled={!clienteAssociado || !dataInicio || !dataFim}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Buscar Cliente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchClienteModalVisible}
        onRequestClose={() => setSearchClienteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.searchModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buscar Cliente</Text>
              <TouchableOpacity onPress={() => setSearchClienteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={Colors.shared.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Digite pelo menos 3 letras do nome..."
                placeholderTextColor={Colors.shared.gray}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.shared.gray} />
                </TouchableOpacity>
              )}
            </View>

            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <Text style={styles.searchHint}>Digite mais {3 - searchTerm.length} letra(s)...</Text>
            )}

            {searchTerm.length >= 3 && searchResults.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="person-outline" size={48} color={Colors.shared.gray} />
                <Text style={styles.noResultsText}>Nenhum cliente encontrado</Text>
                <Text style={styles.noResultsSubtext}>Verifique o nome ou cadastre o cliente na aba Cliente</Text>
              </View>
            )}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id?.toString() || item.cpf}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.clienteResultItem}
                  onPress={() => handleSelectCliente(item)}
                >
                  <View style={styles.clienteResultIcon}>
                    <Ionicons name="person" size={24} color={Colors.shared.primary} />
                  </View>
                  <View style={styles.clienteResultInfo}>
                    <Text style={styles.clienteResultName}>{item.nome}</Text>
                    <Text style={styles.clienteResultCpf}>CPF: {item.cpf}</Text>
                    <Text style={styles.clienteResultPhone}>{item.telefone}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.shared.gray} />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.clienteResultsList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Adicionar Moto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Moto</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Imagem */}
              <Text style={styles.inputLabel}>Foto da Moto</Text>
              {newImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: newImage }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={() => pickImage(true)}
                  >
                    <Ionicons name="camera" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadContainer}>
                  <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(true)}>
                    <Ionicons name="image-outline" size={32} color={Colors.shared.primary} />
                    <Text style={styles.uploadText}>Galeria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto(true)}>
                    <Ionicons name="camera-outline" size={32} color={Colors.shared.primary} />
                    <Text style={styles.uploadText}>Câmera</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Campos */}
              <Text style={styles.inputLabel}>Marca *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Honda, Yamaha"
                placeholderTextColor={Colors.shared.gray}
                value={newBrand}
                onChangeText={setNewBrand}
              />

              <Text style={styles.inputLabel}>Modelo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: CG 160, MT-07"
                placeholderTextColor={Colors.shared.gray}
                value={newModel}
                onChangeText={setNewModel}
              />

              <Text style={styles.inputLabel}>Placa</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC-1234 ou ABC1D23"
                placeholderTextColor={Colors.shared.gray}
                value={newPlaca}
                onChangeText={handlePlacaChange}
                autoCapitalize="characters"
                maxLength={8}
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Ano *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2024"
                    placeholderTextColor={Colors.shared.gray}
                    value={newYear}
                    onChangeText={setNewYear}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Cilindrada (cc)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="160"
                    placeholderTextColor={Colors.shared.gray}
                    value={newCc}
                    onChangeText={setNewCc}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Valor da Diária (R$) *</Text>
              <TextInput
                style={styles.input}
                placeholder="100.00"
                placeholderTextColor={Colors.shared.gray}
                value={newDailyRate}
                onChangeText={setNewDailyRate}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Transmissão</Text>
              <View style={styles.transmissionContainer}>
                <TouchableOpacity
                  style={[
                    styles.transmissionButton,
                    newTransmission === 'Manual' && styles.transmissionButtonActive
                  ]}
                  onPress={() => setNewTransmission('Manual')}
                >
                  <Text style={[
                    styles.transmissionText,
                    newTransmission === 'Manual' && styles.transmissionTextActive
                  ]}>Manual</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.transmissionButton,
                    newTransmission === 'Automática' && styles.transmissionButtonActive
                  ]}
                  onPress={() => setNewTransmission('Automática')}
                >
                  <Text style={[
                    styles.transmissionText,
                    newTransmission === 'Automática' && styles.transmissionTextActive
                  ]}>Automática</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Adicionar Moto"
                onPress={handleAddMoto}
                variant="primary"
                size="large"
                icon={<Ionicons name="add-circle" size={20} color="#FFF" />}
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: Colors.shared.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // Moto Card
  motoCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  motoImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#2D2D2D',
  },
  motoContent: {
    padding: 16,
  },
  motoInfo: {
    marginBottom: 12,
  },
  motoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  motoSpecs: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  motoPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
    marginTop: 8,
  },
  motoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.shared.primary,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.shared.darkBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  uploadContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    color: Colors.shared.primary,
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: Colors.shared.cardBg,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.shared.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 16,
  },
  // Seções do modal de aluguel
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.shared.primary,
  },
  motoInfoCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  motoInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  motoInfoSubtitle: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  motoInfoPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
    marginTop: 8,
  },
  totalCard: {
    backgroundColor: 'rgba(230, 126, 34, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.shared.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#FFF',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  totalValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  associarButton: {
    marginTop: 16,
  },
  clienteAssociadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  clienteAssociadoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
  },
  transmissionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  transmissionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.shared.cardBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  transmissionButtonActive: {
    backgroundColor: Colors.shared.primary,
    borderColor: Colors.shared.primary,
  },
  transmissionText: {
    fontSize: 14,
    color: Colors.shared.gray,
    fontWeight: '500',
  },
  transmissionTextActive: {
    color: '#FFF',
  },
  // Estilos do modal de busca de cliente
  searchClienteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderWidth: 1,
    borderColor: Colors.shared.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  searchClienteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.shared.primary,
  },
  searchModalContent: {
    maxHeight: '70%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFF',
  },
  searchHint: {
    fontSize: 14,
    color: Colors.shared.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  clienteResultsList: {
    paddingBottom: 20,
  },
  clienteResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  clienteResultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clienteResultInfo: {
    flex: 1,
  },
  clienteResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  clienteResultCpf: {
    fontSize: 13,
    color: Colors.shared.gray,
    marginBottom: 2,
  },
  clienteResultPhone: {
    fontSize: 13,
    color: Colors.shared.gray,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#2D2D2D',
  },
  clienteAssociadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  removeClienteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  removeClienteText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
});
