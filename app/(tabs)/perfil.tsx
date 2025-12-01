import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
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
import { AluguelDB, getAllAlugueis } from '../../database/database';

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
  subtitle?: string;
}

function MenuItem({ icon, title, onPress, showBadge, subtitle }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={24} color={Colors.shared.primary} />
        <View>
          <Text style={styles.menuItemText}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {showBadge && <View style={styles.badge} />}
        <Ionicons name="chevron-forward" size={20} color={Colors.shared.gray} />
      </View>
    </TouchableOpacity>
  );
}

export default function PerfilScreen() {
  const { addCliente, clientes } = useClientes();
  const { motos } = useMotos();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [clienteAlugueis, setClienteAlugueis] = useState<AluguelDB[]>([]);
  const [cnh, setCnh] = useState(''); // Número da CNH
    // Dados do cliente
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cnhImage, setCnhImage] = useState<string | null>(null);

  // Tratamento de erros não capturados
  useEffect(() => {
    const errorHandler = (error: any) => {
      if (error?.message?.includes('keep awake')) {
        console.warn('Keep awake error caught and suppressed:', error);
        return true;
      }
      return false;
    };

    // Suprimir erros de keep awake no console
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      if (args[0]?.toString().includes('keep awake')) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Máscara de CPF XXX.XXX.XXX-XX
  const formatCpf = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 3);
    }
    if (cleaned.length > 3) {
      formatted += '.' + cleaned.substring(3, 6);
    }
    if (cleaned.length > 6) {
      formatted += '.' + cleaned.substring(6, 9);
    }
    if (cleaned.length > 9) {
      formatted += '-' + cleaned.substring(9, 11);
    }
    
    return formatted;
  };

  const handleCpfChange = (text: string) => {
    const formatted = formatCpf(text);
    setCpf(formatted);
  };

  // Máscara de telefone (XX) 9XXXX-XXXX
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted = '(' + cleaned.substring(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += ') ' + cleaned.substring(2, 3);
    }
    if (cleaned.length > 3) {
      formatted += cleaned.substring(3, 7);
    }
    if (cleaned.length > 7) {
      formatted += '-' + cleaned.substring(7, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setTelefone(formatted);
  };

  // Máscara de CEP XXXXX-XXX
  const formatCep = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 5);
    }
    if (cleaned.length > 5) {
      formatted += '-' + cleaned.substring(5, 8);
    }
    
    return formatted;
  };

  const handleCepChange = (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria para enviar a CNH.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCnhImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à câmera para tirar foto da CNH.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCnhImage(result.assets[0].uri);
    }
  };

  const updateClientCNHImage = async (newImageUri: string) => {
    if (!selectedCliente) return;
    
    try {
      // Aqui você pode adicionar lógica para atualizar no banco de dados
      setSelectedCliente({
        ...selectedCliente,
        cnhImage: newImageUri,
      });
      Alert.alert('Sucesso', 'Foto da CNH atualizada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a imagem.');
    }
  };

  const pickClientImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateClientCNHImage(result.assets[0].uri);
    }
  };

  const takeClientPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateClientCNHImage(result.assets[0].uri);
    }
  };

  const deleteClientCNHImage = () => {
    Alert.alert(
      'Excluir Imagem',
      'Tem certeza que deseja excluir a foto da CNH?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (!selectedCliente) return;
            setSelectedCliente({
              ...selectedCliente,
              cnhImage: null,
            });
            Alert.alert('Sucesso', 'Foto da CNH removida!');
          },
        },
      ],
    );
  };

  const shareClienteData = async (cliente: any) => {
    try {
      let message = `📋 *DADOS DO CLIENTE*\n\n`;
      message += `👤 *Nome:* ${cliente.nome}\n`;
      message += `📄 *CPF:* ${cliente.cpf}\n`;
      
      if (cliente.cnh) {
        message += `🪪 *CNH:* ${cliente.cnh}\n`;
      }
      
      if (cliente.telefone) {
        message += `📞 *Telefone:* ${cliente.telefone}\n`;
      }
      
      if (cliente.rua) {
        message += `\n📍 *ENDEREÇO*\n`;
        message += `${cliente.rua}, ${cliente.numero}`;
        if (cliente.complemento) {
          message += ` - ${cliente.complemento}`;
        }
        message += `\n${cliente.bairro} - ${cliente.cidade}/${cliente.estado}`;
        if (cliente.cep) {
          message += `\nCEP: ${cliente.cep}`;
        }
      }
      
      // Buscar histórico de aluguéis
      const alugueis = getAllAlugueis();
      const clienteHistory = alugueis.filter(a => a.clienteId === cliente.id);
      
      if (clienteHistory.length > 0) {
        message += `\n\n📊 *HISTÓRICO DE LOCAÇÕES*\n`;
        message += `Total: ${clienteHistory.length} ${clienteHistory.length === 1 ? 'locação' : 'locações'}\n\n`;
        
        clienteHistory.forEach((aluguel, index) => {
          const moto = motos.find(m => m.id === String(aluguel.motoId));
          message += `${index + 1}. ${moto ? `${moto.brand} ${moto.model}` : aluguel.motoNome || 'Moto'}\n`;
          message += `   📅 ${aluguel.dataInicio} até ${aluguel.dataFim}\n`;
          message += `   💰 R$ ${aluguel.valorTotal.toFixed(2)}\n`;
          message += `   Status: ${aluguel.status === 'ativo' ? '✅ Ativo' : '✔️ Finalizado'}\n\n`;
        });
      }

      await Share.share({
        message: message,
        url: cliente.cnhImage,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar os dados.');
    }
  };

  // Função para abrir modal de detalhes do cliente
  const handleClientePress = (cliente: any) => {
    setSelectedCliente(cliente);
    
    // Buscar histórico de aluguéis do cliente
    const alugueis = getAllAlugueis();
    const clienteHistory = alugueis.filter(a => a.clienteId === cliente.id);
    setClienteAlugueis(clienteHistory);
    
    setDetailsModalVisible(true);
  };

  const handleSaveDados = () => {
    if (!nomeCompleto.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o nome completo.');
      return;
    }
    if (cpf.replace(/\D/g, '').length < 11) {
      Alert.alert('Atenção', 'Por favor, preencha o CPF completo.');
      return;
    }
    if (!rua.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha a rua.');
      return;
    }
    if (!numero.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o número.');
      return;
    }
    if (!bairro.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o bairro.');
      return;
    }
    if (!cidade.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha a cidade.');
      return;
    }
    if (!estado.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o estado.');
      return;
    }
    if (cep.replace(/\D/g, '').length < 8) {
      Alert.alert('Atenção', 'Por favor, preencha o CEP completo.');
      return;
    }
    if (telefone.replace(/\D/g, '').length < 11) {
      Alert.alert('Atenção', 'Por favor, preencha o telefone completo (DDD + 9 dígitos).');
      return;
    }
    if (!cnhImage) {
      Alert.alert('Atenção', 'Por favor, envie a foto da sua CNH.');
      return;
    }
    
    try {
      // Salvar no banco de dados
      addCliente({
        nome: nomeCompleto,
        cpf: cpf,
        cnh: cnh,
        telefone: telefone,
        rua: rua,
        numero: numero,
        complemento: complemento,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        cep: cep,
        cnhImage: cnhImage,
      });
      
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      setModalVisible(false);
      
      // Limpar formulário
      setNomeCompleto('');
      setCpf('');
      setCnh('');
      setRua('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setEstado('');
      setCep('');
      setTelefone('');
      setCnhImage(null);
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint')) {
        Alert.alert('Erro', 'Já existe um cliente cadastrado com este CPF.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao salvar o cadastro. Tente novamente.');
        console.error('Erro ao salvar cliente:', error);
      }
    }
  };

  const isCadastroCompleto = nomeCompleto && cpf && rua && numero && bairro && cidade && estado && cep && telefone && cnhImage;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.shared.gray} />
            </View>
          </View>
          <Text style={styles.userName}>Cadastro de Clientes</Text>
          <Text style={styles.userEmail}>{clientes.length} cliente(s) cadastrado(s)</Text>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Ações</Text>
          <MenuItem 
            icon="person-add-outline" 
            title="Cadastrar Novo Cliente" 
            subtitle="Adicione um novo cliente ao sistema"
            onPress={() => setModalVisible(true)} 
          />
        </View>

        {/* Lista de Clientes */}
        {clientes.length > 0 && (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Clientes Cadastrados</Text>
            {clientes.map((cliente) => (
              <TouchableOpacity 
                key={cliente.id}
                style={styles.clienteListItem}
                onPress={() => handleClientePress(cliente)}
              >
                <View style={styles.clienteAvatar}>
                  <Ionicons name="person" size={24} color={Colors.shared.primary} />
                </View>
                <View style={styles.clienteInfo}>
                  <Text style={styles.clienteNome}>{cliente.nome}</Text>
                  <Text style={styles.clienteCpf}>CPF: {cliente.cpf}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.shared.gray} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </ScrollView>

      {/* Modal Dados Pessoais */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome completo"
                placeholderTextColor={Colors.shared.gray}
                value={nomeCompleto}
                onChangeText={setNomeCompleto}
              />

              <Text style={styles.inputLabel}>CPF</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor={Colors.shared.gray}
                value={cpf}
                onChangeText={handleCpfChange}
                keyboardType="numeric"
                maxLength={14}
              />

              <Text style={styles.sectionTitle}>Endereço</Text>

              <Text style={styles.inputLabel}>Rua</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da rua"
                placeholderTextColor={Colors.shared.gray}
                value={rua}
                onChangeText={setRua}
              />

              <View style={styles.rowInputs}>
                <View style={styles.smallInput}>
                  <Text style={styles.inputLabel}>Número</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nº"
                    placeholderTextColor={Colors.shared.gray}
                    value={numero}
                    onChangeText={setNumero}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.largeInput}>
                  <Text style={styles.inputLabel}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apto, Bloco (opcional)"
                    placeholderTextColor={Colors.shared.gray}
                    value={complemento}
                    onChangeText={setComplemento}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Bairro</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do bairro"
                placeholderTextColor={Colors.shared.gray}
                value={bairro}
                onChangeText={setBairro}
              />

              <View style={styles.rowInputs}>
                <View style={styles.largeInput}>
                  <Text style={styles.inputLabel}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome da cidade"
                    placeholderTextColor={Colors.shared.gray}
                    value={cidade}
                    onChangeText={setCidade}
                  />
                </View>
                <View style={styles.smallInput}>
                  <Text style={styles.inputLabel}>Estado</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="UF"
                    placeholderTextColor={Colors.shared.gray}
                    value={estado}
                    onChangeText={setEstado}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>CEP</Text>
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                placeholderTextColor={Colors.shared.gray}
                value={cep}
                onChangeText={handleCepChange}
                keyboardType="numeric"
                maxLength={9}
              />

              <Text style={styles.inputLabel}>Telefone (DDD + 9 dígitos)</Text>
              <TextInput
                style={styles.input}
                placeholder="(82) 99999-9999"
                placeholderTextColor={Colors.shared.gray}
                value={telefone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={16}
              />

              <Text style={styles.inputLabel}>Número da CNH</Text>
              <TextInput
                style={styles.input}
                placeholder="00000000000"
                placeholderTextColor={Colors.shared.gray}
                value={cnh}
                onChangeText={setCnh}
                keyboardType="numeric"
                maxLength={11}
              />

              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Documentação</Text>

              <Text style={styles.inputLabel}>Foto da CNH</Text>
              <Text style={styles.inputHelper}>
                Envie uma foto legível da sua CNH (frente e verso ou CNH digital)
              </Text>

              {cnhImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: cnhImage }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setCnhImage(null)}
                  >
                    <Ionicons name="close-circle" size={28} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadContainer}>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={32} color={Colors.shared.primary} />
                    <Text style={styles.uploadText}>Galeria</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={32} color={Colors.shared.primary} />
                    <Text style={styles.uploadText}>Câmera</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Button
                title="Salvar Cadastro"
                onPress={handleSaveDados}
                variant="primary"
                size="large"
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Detalhes do Cliente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Cliente</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedCliente && (
                <>
                  {/* Informações do Cliente */}
                  <View style={styles.detailsSection}>
                    <View style={styles.detailsAvatarContainer}>
                      <View style={styles.detailsAvatar}>
                        <Ionicons name="person" size={48} color={Colors.shared.primary} />
                      </View>
                      <Text style={styles.detailsNome}>{selectedCliente.nome}</Text>
                    </View>

                    <View style={styles.detailsInfoCard}>
                      <View style={styles.detailsInfoRow}>
                        <Ionicons name="card-outline" size={20} color={Colors.shared.primary} />
                        <View style={styles.detailsInfoTexts}>
                          <Text style={styles.detailsInfoLabel}>CPF</Text>
                          <Text style={styles.detailsInfoValue}>{selectedCliente.cpf}</Text>
                        </View>
                      </View>

                      {selectedCliente.cnh && (
                        <>
                          <View style={styles.detailsDivider} />
                          <View style={styles.detailsInfoRow}>
                            <Ionicons name="card" size={20} color={Colors.shared.primary} />
                            <View style={styles.detailsInfoTexts}>
                              <Text style={styles.detailsInfoLabel}>CNH</Text>
                              <Text style={styles.detailsInfoValue}>{selectedCliente.cnh}</Text>
                            </View>
                          </View>
                        </>
                      )}

                      {selectedCliente.telefone && (
                        <>
                          <View style={styles.detailsDivider} />
                          <View style={styles.detailsInfoRow}>
                            <Ionicons name="call-outline" size={20} color={Colors.shared.primary} />
                            <View style={styles.detailsInfoTexts}>
                              <Text style={styles.detailsInfoLabel}>Telefone</Text>
                              <Text style={styles.detailsInfoValue}>{selectedCliente.telefone}</Text>
                            </View>
                          </View>
                        </>
                      )}

                      {selectedCliente.rua && (
                        <>
                          <View style={styles.detailsDivider} />
                          <View style={styles.detailsInfoRow}>
                            <Ionicons name="location-outline" size={20} color={Colors.shared.primary} />
                            <View style={styles.detailsInfoTexts}>
                              <Text style={styles.detailsInfoLabel}>Endereço</Text>
                              <Text style={styles.detailsInfoValue}>
                                {selectedCliente.rua}, {selectedCliente.numero}
                                {selectedCliente.complemento ? ` - ${selectedCliente.complemento}` : ''}
                                {'\n'}{selectedCliente.bairro} - {selectedCliente.cidade}/{selectedCliente.estado}
                                {selectedCliente.cep ? `\nCEP: ${selectedCliente.cep}` : ''}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Imagem da CNH */}
                    {selectedCliente.cnhImage ? (
                      <View style={styles.cnhImageContainer}>
                        <View style={styles.cnhImageHeader}>
                          <Text style={styles.cnhImageLabel}>
                            <Ionicons name="document-text" size={16} color={Colors.shared.primary} /> Foto da CNH
                          </Text>
                          <View style={styles.cnhActionButtons}>
                            <TouchableOpacity 
                              style={styles.cnhActionButton}
                              onPress={() => shareClienteData(selectedCliente)}
                            >
                              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.cnhActionButton}
                              onPress={deleteClientCNHImage}
                            >
                              <Ionicons name="trash-outline" size={20} color={Colors.dark.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={styles.cnhImagePreview}
                          onPress={() => setImageViewerVisible(true)}
                        >
                          <Image 
                            source={{ uri: selectedCliente.cnhImage }} 
                            style={styles.cnhImage}
                            resizeMode="cover"
                          />
                          <View style={styles.cnhImageOverlay}>
                            <Ionicons name="expand-outline" size={24} color="#FFF" />
                            <Text style={styles.cnhImageOverlayText}>Toque para ampliar</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.cnhImageContainer}>
                        <Text style={styles.cnhImageLabel}>
                          <Ionicons name="document-text" size={16} color={Colors.shared.primary} /> Foto da CNH
                        </Text>
                        <View style={styles.uploadContainer}>
                          <TouchableOpacity style={styles.uploadButton} onPress={pickClientImageFromGallery}>
                            <Ionicons name="image-outline" size={32} color={Colors.shared.primary} />
                            <Text style={styles.uploadText}>Galeria</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.uploadButton} onPress={takeClientPhoto}>
                            <Ionicons name="camera-outline" size={32} color={Colors.shared.primary} />
                            <Text style={styles.uploadText}>Câmera</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Histórico de Locações */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>
                      <Ionicons name="time-outline" size={20} color={Colors.shared.primary} /> Histórico de Locações
                    </Text>

                    {clienteAlugueis.length === 0 ? (
                      <View style={styles.emptyHistoryCard}>
                        <Ionicons name="document-text-outline" size={48} color={Colors.shared.gray} />
                        <Text style={styles.emptyHistoryText}>Nenhuma locação registrada</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.historyCount}>
                          {clienteAlugueis.length} {clienteAlugueis.length === 1 ? 'locação' : 'locações'}
                        </Text>
                        {clienteAlugueis.map((aluguel, index) => {
                          const moto = motos.find(m => m.id === String(aluguel.motoId));
                          return (
                            <View key={index} style={styles.historyCard}>
                              <View style={styles.historyHeader}>
                                <View style={styles.historyMotoInfo}>
                                  <Ionicons name="bicycle" size={20} color={Colors.shared.primary} />
                                  <Text style={styles.historyMotoNome}>
                                    {moto ? `${moto.brand} ${moto.model}` : aluguel.motoNome || 'Moto não encontrada'}
                                  </Text>
                                </View>
                                <View style={[
                                  styles.historyStatusBadge,
                                  aluguel.status === 'ativo' ? styles.statusAtivoBadge : styles.statusFinalizadoBadge
                                ]}>
                                  <Text style={styles.historyStatusText}>
                                    {aluguel.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.historyDetails}>
                                <View style={styles.historyDetailRow}>
                                  <Ionicons name="calendar-outline" size={16} color={Colors.shared.gray} />
                                  <Text style={styles.historyDetailText}>
                                    {aluguel.dataInicio} até {aluguel.dataFim}
                                  </Text>
                                </View>
                                <View style={styles.historyDetailRow}>
                                  <Ionicons name="cash-outline" size={16} color={Colors.shared.gray} />
                                  <Text style={styles.historyDetailText}>
                                    R$ {aluguel.valorTotal.toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Visualização de Imagem em Tela Cheia */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity 
            style={styles.closeImageButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="#FFF" />
          </TouchableOpacity>
          
          {selectedCliente?.cnhImage && (
            <Image 
              source={{ uri: selectedCliente.cnhImage }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
          
          <View style={styles.imageViewerActions}>
            <TouchableOpacity 
              style={styles.imageActionButton}
              onPress={() => shareClienteData(selectedCliente)}
            >
              <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              <Text style={styles.imageActionText}>Compartilhar</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.shared.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.shared.gray,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.shared.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 12,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginLeft: 12,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.shared.primary,
    marginRight: 8,
  },
  versionText: {
    fontSize: 12,
    color: Colors.shared.gray,
    textAlign: 'center',
    marginVertical: 24,
  },
  // Modal Styles
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
  inputHelper: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginBottom: 16,
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
  saveButton: {
    marginTop: 32,
    marginBottom: 16,
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
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.shared.cardBg,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
    marginBottom: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  smallInput: {
    flex: 1,
  },
  largeInput: {
    flex: 2,
  },
  // Estilos da lista de clientes
  clienteListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  clienteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  clienteCpf: {
    fontSize: 13,
    color: Colors.shared.gray,
  },
  // Estilos do Modal de Detalhes
  detailsSection: {
    marginBottom: 24,
  },
  detailsAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.shared.primary,
  },
  detailsNome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  detailsInfoCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  detailsInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailsInfoTexts: {
    flex: 1,
  },
  detailsInfoLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginBottom: 4,
  },
  detailsInfoValue: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 12,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  emptyHistoryCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginTop: 12,
  },
  historyCount: {
    fontSize: 13,
    color: Colors.shared.gray,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyMotoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyMotoNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  historyStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusAtivoBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusFinalizadoBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  historyDetails: {
    gap: 8,
  },
  historyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDetailText: {
    fontSize: 14,
    color: Colors.shared.gray,
  },
  // Estilos da CNH no Modal de Detalhes
  cnhImageContainer: {
    marginTop: 20,
  },
  cnhImageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cnhImageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.shared.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  cnhActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cnhActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.shared.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  cnhImagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  cnhImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.shared.cardBg,
  },
  cnhImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cnhImageOverlayText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  // Estilos do Modal de Visualização de Imagem
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  imageViewerActions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 16,
  },
  imageActionButton: {
    backgroundColor: Colors.shared.cardBg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  imageActionText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
});
