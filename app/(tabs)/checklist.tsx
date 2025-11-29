import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { ClienteDB } from '@/database/database';
import { useClientes } from '../../context/ClientesContext';
import { useMotos } from '../../context/MotosContext';
import { Motorcycle } from '../../types';

interface CheckItem {
  id: string;
  label: string;
  category: string;
  hasIssue: boolean | null; // null = não verificado, true = com avaria, false = sem avaria
  observation: string;
}

const initialCheckItems: CheckItem[] = [
  // Pintura
  { id: 'pintura_tanque', label: 'Tanque', category: 'Pintura', hasIssue: null, observation: '' },
  { id: 'pintura_carenagem', label: 'Carenagem', category: 'Pintura', hasIssue: null, observation: '' },
  { id: 'pintura_paralamas', label: 'Paralamas', category: 'Pintura', hasIssue: null, observation: '' },
  { id: 'pintura_lateral', label: 'Lateral', category: 'Pintura', hasIssue: null, observation: '' },
  // Pneus
  { id: 'pneu_dianteiro', label: 'Pneu Dianteiro', category: 'Pneus', hasIssue: null, observation: '' },
  { id: 'pneu_traseiro', label: 'Pneu Traseiro', category: 'Pneus', hasIssue: null, observation: '' },
  // Farol
  { id: 'farol', label: 'Farol', category: 'Farol', hasIssue: null, observation: '' },
  // Lanternas
  { id: 'lanterna', label: 'Lanterna', category: 'Lanternas', hasIssue: null, observation: '' },
  { id: 'lanterna_freio', label: 'Luz de Freio', category: 'Lanternas', hasIssue: null, observation: '' },
  // Banco
  { id: 'banco_forro', label: 'Forro do Banco', category: 'Banco', hasIssue: null, observation: '' },
  // Retrovisores
  { id: 'retrovisor_esquerdo', label: 'Retrovisor Esquerdo', category: 'Retrovisores', hasIssue: null, observation: '' },
  { id: 'retrovisor_direito', label: 'Retrovisor Direito', category: 'Retrovisores', hasIssue: null, observation: '' },
];

export default function ChecklistScreen() {
  const { searchClientes } = useClientes();
  const { motos } = useMotos();
  
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ClienteDB[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteDB | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [motoSearchText, setMotoSearchText] = useState('');
  const [selectedMoto, setSelectedMoto] = useState<Motorcycle | null>(null);
  const [showMotoDropdown, setShowMotoDropdown] = useState(false);
  const [filteredMotos, setFilteredMotos] = useState<Motorcycle[]>([]);
  
  const [checkItems, setCheckItems] = useState<CheckItem[]>(initialCheckItems);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'Pintura', 'Pneus', 'Farol', 'Lanternas', 'Banco', 'Retrovisores'
  ]);

  // Buscar cliente ao digitar
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length >= 3) {
      const results = searchClientes(text);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Buscar moto
  const handleMotoSearch = (text: string) => {
    setMotoSearchText(text);
    if (text.length >= 2) {
      const filtered = motos.filter(m => 
        m.plate?.toLowerCase().includes(text.toLowerCase()) ||
        m.model.toLowerCase().includes(text.toLowerCase()) ||
        m.brand.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMotos(filtered);
      setShowMotoDropdown(true);
    } else {
      setFilteredMotos([]);
      setShowMotoDropdown(false);
    }
  };

  // Selecionar cliente
  const handleSelectCliente = (cliente: ClienteDB) => {
    setSelectedCliente(cliente);
    setSearchText(cliente.nome);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Selecionar moto
  const handleSelectMoto = (moto: Motorcycle) => {
    setSelectedMoto(moto);
    setMotoSearchText(`${moto.brand} ${moto.model} - ${moto.plate || 'Sem placa'}`);
    setShowMotoDropdown(false);
    setFilteredMotos([]);
  };

  // Limpar seleção
  const handleClearCliente = () => {
    setSelectedCliente(null);
    setSearchText('');
    setSearchResults([]);
  };

  // Limpar moto
  const handleClearMoto = () => {
    setSelectedMoto(null);
    setMotoSearchText('');
    setFilteredMotos([]);
  };

  // Toggle categoria expandida
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Atualizar item do checklist
  const updateCheckItem = (itemId: string, hasIssue: boolean) => {
    setCheckItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, hasIssue } : item
      )
    );
  };

  // Agrupar itens por categoria
  const groupedItems = checkItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CheckItem[]>);

  // Calcular progresso
  const totalItems = checkItems.length;
  const checkedItems = checkItems.filter(item => item.hasIssue !== null).length;
  const itemsWithIssue = checkItems.filter(item => item.hasIssue === true).length;

  // Resetar checklist
  const handleReset = () => {
    setCheckItems(initialCheckItems);
    setSelectedCliente(null);
    setSelectedMoto(null);
    setSearchText('');
    setMotoSearchText('');
  };

  // Gerar PDF da vistoria
  const generatePDF = async () => {
    if (!selectedCliente || !selectedMoto) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const categorias = Object.entries(groupedItems);

    // Construir endereço
    const endereco = selectedCliente.rua 
      ? `${selectedCliente.rua}, ${selectedCliente.numero || 's/n'} - ${selectedCliente.bairro || ''}, ${selectedCliente.cidade || ''}-${selectedCliente.estado || ''}`
      : '-';

    // Construir HTML dos itens da vistoria
    const categoriasHtml = categorias.map(([categoria, items]) => {
      const itemsHtml = (items as CheckItem[]).map(item => `
        <tr>
          <td>${item.label}</td>
          <td class="${item.hasIssue === false ? 'status-ok' : ''}">${item.hasIssue === false ? 'SIM' : '-'}</td>
          <td class="${item.hasIssue === true ? 'status-issue' : ''}">${item.hasIssue === true ? 'SIM' : '-'}</td>
        </tr>
      `).join('');
      
      return `
        <div class="category">
          <div class="category-title">${categoria}</div>
          <table class="check-table">
            <tr>
              <th style="width: 60%">Item</th>
              <th style="width: 20%">Sem Avaria</th>
              <th style="width: 20%">Com Avaria</th>
            </tr>
            ${itemsHtml}
          </table>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Vistoria</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 10px; color: #333; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #F97316; padding-bottom: 10px; }
          .header h1 { color: #F97316; font-size: 18px; margin-bottom: 3px; }
          .header p { font-size: 9px; color: #666; }
          .info-section { margin-bottom: 12px; }
          .info-section h2 { font-size: 11px; color: #F97316; margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
          .info-item { margin-bottom: 3px; }
          .info-item strong { color: #333; }
          .category { margin-bottom: 8px; }
          .category-title { font-size: 10px; font-weight: bold; background: #f5f5f5; padding: 4px 6px; margin-bottom: 4px; }
          .check-table { width: 100%; border-collapse: collapse; font-size: 9px; }
          .check-table th, .check-table td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; }
          .check-table th { background: #f9f9f9; font-weight: bold; }
          .status-ok { color: #22C55E; font-weight: bold; }
          .status-issue { color: #EF4444; font-weight: bold; }
          .summary { background: #FFF7ED; padding: 8px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #F97316; }
          .summary h3 { font-size: 10px; color: #F97316; margin-bottom: 4px; }
          .summary p { font-size: 9px; }
          .signatures { margin-top: 30px; }
          .signatures h2 { font-size: 11px; color: #F97316; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
          .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; }
          .signature-box { text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
          .signature-name { font-size: 9px; font-weight: bold; }
          .signature-role { font-size: 8px; color: #666; }
          .footer { margin-top: 20px; text-align: center; font-size: 8px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LOCMOTO</h1>
          <p>Relatório de Vistoria de Veículo</p>
        </div>

        <div class="summary">
          <h3>Resumo da Vistoria</h3>
          <p><strong>Data:</strong> ${dataAtual} às ${horaAtual}</p>
          <p><strong>Total de itens:</strong> ${checkedItems}/${totalItems}</p>
          <p><strong>Com avaria:</strong> ${itemsWithIssue} | <strong>Sem avaria:</strong> ${checkedItems - itemsWithIssue}</p>
        </div>

        <div class="info-section">
          <h2>Dados do Cliente</h2>
          <div class="info-grid">
            <div class="info-item"><strong>Nome:</strong> ${selectedCliente.nome}</div>
            <div class="info-item"><strong>CPF:</strong> ${selectedCliente.cpf}</div>
            <div class="info-item"><strong>CNH:</strong> ${selectedCliente.cnh || '-'}</div>
            <div class="info-item"><strong>Telefone:</strong> ${selectedCliente.telefone || '-'}</div>
          </div>
          <div class="info-item" style="margin-top: 4px;">
            <strong>Endereço:</strong> ${endereco}
          </div>
        </div>

        <div class="info-section">
          <h2>Dados da Moto</h2>
          <div class="info-grid">
            <div class="info-item"><strong>Marca/Modelo:</strong> ${selectedMoto.brand} ${selectedMoto.model}</div>
            <div class="info-item"><strong>Ano:</strong> ${selectedMoto.year}</div>
            <div class="info-item"><strong>Placa:</strong> ${selectedMoto.plate || '-'}</div>
            <div class="info-item"><strong>Cilindrada:</strong> ${selectedMoto.specs?.cc || '-'} cc</div>
          </div>
        </div>

        <div class="info-section">
          <h2>Itens da Vistoria</h2>
          ${categoriasHtml}
        </div>

        <div class="signatures">
          <h2>Assinaturas</h2>
          <p style="font-size: 9px; margin-bottom: 10px;">
            Declaro que recebi o veículo nas condições descritas acima e me comprometo a devolvê-lo nas mesmas condições, 
            salvo desgaste natural de uso. Qualquer avaria não constante neste documento será de minha responsabilidade.
          </p>
          <div class="signature-grid">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-name">${selectedCliente.nome}</div>
                <div class="signature-role">Cliente</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-name">_______________________</div>
                <div class="signature-role">Responsável Legal - LocMoto</div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>LocMoto - Aluguel de Motos | Documento gerado em ${dataAtual} às ${horaAtual}</p>
          <p>Este documento tem validade como termo de vistoria e entrega do veículo.</p>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Relatório de Vistoria',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF');
    }
  };

  // Finalizar vistoria
  const handleFinish = () => {
    if (!selectedCliente) {
      Alert.alert('Atenção', 'Selecione um cliente primeiro!');
      return;
    }
    if (!selectedMoto) {
      Alert.alert('Atenção', 'Selecione uma moto primeiro!');
      return;
    }
    if (checkedItems < totalItems) {
      Alert.alert('Atenção', 'Complete todos os itens da vistoria!');
      return;
    }

    const mensagem = `Cliente: ${selectedCliente.nome}\nMoto: ${selectedMoto.brand} ${selectedMoto.model}\nItens com avaria: ${itemsWithIssue}\n\nDeseja gerar o PDF do relatório?`;

    Alert.alert(
      'Finalizar Vistoria',
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Gerar PDF', onPress: generatePDF },
      ]
    );
  };

  const renderCheckItem = (item: CheckItem) => (
    <View key={item.id} style={styles.checkItem}>
      <Text style={styles.checkItemLabel}>{item.label}</Text>
      <View style={styles.checkButtons}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            styles.checkButtonOk,
            item.hasIssue === false && styles.checkButtonOkActive,
          ]}
          onPress={() => updateCheckItem(item.id, false)}
        >
          <Text style={[
            styles.checkButtonText,
            item.hasIssue === false && styles.checkButtonTextActive,
          ]}>
            S
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkButton,
            styles.checkButtonIssue,
            item.hasIssue === true && styles.checkButtonIssueActive,
          ]}
          onPress={() => updateCheckItem(item.id, true)}
        >
          <Text style={[
            styles.checkButtonText,
            item.hasIssue === true && styles.checkButtonTextActive,
          ]}>
            N
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategory = (category: string, items: CheckItem[]) => {
    const isExpanded = expandedCategories.includes(category);
    const categoryChecked = items.filter(i => i.hasIssue !== null).length;
    const categoryIssues = items.filter(i => i.hasIssue === true).length;

    return (
      <View key={category} style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleCategory(category)}
        >
          <View style={styles.categoryTitleContainer}>
            <Ionicons
              name={getCategoryIcon(category)}
              size={20}
              color={Colors.shared.primary}
            />
            <Text style={styles.categoryTitle}>{category}</Text>
          </View>
          <View style={styles.categoryStatus}>
            <Text style={styles.categoryCount}>
              {categoryChecked}/{items.length}
            </Text>
            {categoryIssues > 0 && (
              <View style={styles.issueBadge}>
                <Text style={styles.issueBadgeText}>{categoryIssues}</Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.shared.gray}
            />
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.categoryItems}>
            {items.map(renderCheckItem)}
          </View>
        )}
      </View>
    );
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'Pintura': return 'color-palette-outline';
      case 'Pneus': return 'ellipse-outline';
      case 'Farol': return 'flashlight-outline';
      case 'Lanternas': return 'bulb-outline';
      case 'Banco': return 'bed-outline';
      case 'Retrovisores': return 'eye-outline';
      default: return 'checkmark-circle-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vistoria</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Ionicons name="refresh" size={24} color={Colors.shared.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Busca de Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.shared.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do cliente (mín. 3 letras)"
              placeholderTextColor={Colors.shared.gray}
              value={searchText}
              onChangeText={handleSearch}
              editable={!selectedCliente}
            />
            {selectedCliente && (
              <TouchableOpacity onPress={handleClearCliente} style={styles.clearButton}>
                <Ionicons name="close-circle" size={24} color={Colors.shared.gray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdown de resultados */}
          {showDropdown && searchResults.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id?.toString() || ''}
                    style={styles.dropdownItem}
                    onPress={() => handleSelectCliente(item)}
                  >
                    <Text style={styles.dropdownItemName}>{item.nome}</Text>
                    <Text style={styles.dropdownItemCpf}>CPF: {item.cpf}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Dados do cliente selecionado */}
          {selectedCliente && (
            <View style={styles.clienteCard}>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>Nome:</Text>
                <Text style={styles.clienteValue}>{selectedCliente.nome}</Text>
              </View>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>CPF:</Text>
                <Text style={styles.clienteValue}>{selectedCliente.cpf}</Text>
              </View>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>CNH:</Text>
                <Text style={styles.clienteValue}>{selectedCliente.cnh || '-'}</Text>
              </View>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>Telefone:</Text>
                <Text style={styles.clienteValue}>{selectedCliente.telefone || '-'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Busca de Moto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moto</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="bicycle" size={20} color={Colors.shared.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar moto (placa, modelo ou marca)"
              placeholderTextColor={Colors.shared.gray}
              value={motoSearchText}
              onChangeText={handleMotoSearch}
              editable={!selectedMoto}
            />
            {selectedMoto && (
              <TouchableOpacity onPress={handleClearMoto} style={styles.clearButton}>
                <Ionicons name="close-circle" size={24} color={Colors.shared.gray} />
              </TouchableOpacity>
            )}
          </View>

          {showMotoDropdown && filteredMotos.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {filteredMotos.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => handleSelectMoto(item)}
                  >
                    <Text style={styles.dropdownItemName}>{item.brand} {item.model}</Text>
                    <Text style={styles.dropdownItemCpf}>Placa: {item.plate || '-'} | {item.year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedMoto && (
            <View style={styles.clienteCard}>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>Marca/Modelo:</Text>
                <Text style={styles.clienteValue}>{selectedMoto.brand} {selectedMoto.model}</Text>
              </View>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>Ano:</Text>
                <Text style={styles.clienteValue}>{selectedMoto.year}</Text>
              </View>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>Placa:</Text>
                <Text style={styles.clienteValue}>{selectedMoto.plate || '-'}</Text>
              </View>
              <View style={styles.clienteRow}>
                <Text style={styles.clienteLabel}>Cilindrada:</Text>
                <Text style={styles.clienteValue}>{selectedMoto.specs?.cc || '-'} cc</Text>
              </View>
            </View>
          )}
        </View>

        {/* Progresso */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progresso da Vistoria</Text>
            <Text style={styles.progressText}>{checkedItems}/{totalItems}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(checkedItems / totalItems) * 100}%` }
              ]} 
            />
          </View>
          {itemsWithIssue > 0 && (
            <Text style={styles.issueWarning}>
              ⚠️ {itemsWithIssue} item(ns) com avaria
            </Text>
          )}
        </View>

        {/* Checklist por categoria */}
        <View style={styles.checklistSection}>
          <Text style={styles.sectionTitle}>Itens de Vistoria</Text>
          <Text style={styles.checklistHelp}>
            S = Sem avaria | N = Com avaria
          </Text>
          {Object.entries(groupedItems).map(([category, items]) =>
            renderCategory(category, items)
          )}
        </View>

        {/* Botão Finalizar dentro do ScrollView */}
        <View style={styles.finishButtonContainer}>
          <TouchableOpacity
            style={[
              styles.finishButton,
              (!selectedCliente || !selectedMoto || checkedItems < totalItems) && styles.finishButtonDisabled
            ]}
            onPress={handleFinish}
            disabled={!selectedCliente || !selectedMoto || checkedItems < totalItems}
          >
            <Ionicons name="document-text" size={24} color="#FFF" />
            <Text style={styles.finishButtonText}>Finalizar e Gerar PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Espaço para o tab bar */}
        <View style={{ height: 120 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.shared.cardBg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  dropdown: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.shared.darkBg,
  },
  dropdownItemName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownItemCpf: {
    color: Colors.shared.gray,
    fontSize: 14,
    marginTop: 4,
  },
  clienteCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  clienteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  clienteLabel: {
    color: Colors.shared.gray,
    fontSize: 14,
  },
  clienteValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 24,
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    color: Colors.shared.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.shared.darkBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.shared.primary,
    borderRadius: 4,
  },
  issueWarning: {
    color: '#F59E0B',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  checklistSection: {
    marginTop: 24,
  },
  checklistHelp: {
    color: Colors.shared.gray,
    fontSize: 13,
    marginBottom: 16,
  },
  categoryContainer: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    color: Colors.shared.gray,
    fontSize: 14,
  },
  issueBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  issueBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.shared.darkBg,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.shared.darkBg,
  },
  checkItemLabel: {
    color: '#FFF',
    fontSize: 15,
  },
  checkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  checkButtonOk: {
    borderColor: '#22C55E',
    backgroundColor: 'transparent',
  },
  checkButtonOkActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkButtonIssue: {
    borderColor: '#EF4444',
    backgroundColor: 'transparent',
  },
  checkButtonIssueActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.shared.gray,
  },
  checkButtonTextActive: {
    color: '#FFF',
  },
  finishButtonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shared.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
