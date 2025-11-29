import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
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
  const [modalVisible, setModalVisible] = useState(false);
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
                onPress={() => Alert.alert(cliente.nome, `CPF: ${cliente.cpf}\nTelefone: ${cliente.telefone || 'Não informado'}`)}
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
});
