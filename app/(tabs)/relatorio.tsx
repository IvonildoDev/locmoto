import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import Colors from '../../constants/Colors';
import { useClientes } from '../../context/ClientesContext';
import { useMotos } from '../../context/MotosContext';
import { AluguelDB, getAlugueisAtivos, getAlugueisFinalizados } from '../../database/database';

export default function RelatorioScreen() {
  const { motos, alugueisAtivos, finalizarAluguel } = useMotos();
  const { clientes } = useClientes();
  const [selectedTab, setSelectedTab] = useState<'resumo' | 'clientes' | 'motos' | 'locadas'>('resumo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [alugueisFinalizados, setAlugueisFinalizados] = useState<AluguelDB[]>([]);
  const [alugueisAtivosDB, setAlugueisAtivosDB] = useState<AluguelDB[]>([]);
  
  // Estado para modal de confirmação de entrega
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [entregaData, setEntregaData] = useState<{
    motoId: string;
    motoNome: string;
    clienteNome: string;
    valorTotal: number;
    dataInicio: string;
    dataFim: string;
  } | null>(null);

  const motosDisponiveis = motos.filter(m => m.available);
  const motosAlugadas = motos.filter(m => !m.available);

  // Carregar aluguéis finalizados e ativos do banco
  useEffect(() => {
    const loadAlugueisFromDB = async () => {
      try {
        const finalizados = await getAlugueisFinalizados();
        const ativos = getAlugueisAtivos();
        setAlugueisFinalizados(finalizados);
        setAlugueisAtivosDB(ativos);
      } catch (error) {
        console.error('Erro ao carregar aluguéis:', error);
      }
    };
    loadAlugueisFromDB();
  }, [alugueisAtivos]);

  // Montar lista de clientes com aluguéis (ativos e finalizados)
  const clientesComAluguel = React.useMemo(() => {
    const lista: Array<{
      id: string;
      nome: string;
      cpf: string;
      telefone: string;
      moto: string;
      dataInicio: string;
      dataFim: string;
      valorTotal: number;
      status: 'ativo' | 'finalizado';
    }> = [];

    // Adicionar aluguéis ativos
    Object.entries(alugueisAtivos).forEach(([motoId, aluguel]) => {
      if (aluguel.cliente) {
        const moto = motos.find(m => m.id === motoId);
        lista.push({
          id: `ativo-${motoId}`,
          nome: aluguel.cliente.nome,
          cpf: aluguel.cliente.cpf,
          telefone: aluguel.cliente.telefone,
          moto: moto ? `${moto.brand} ${moto.model}` : 'Moto não encontrada',
          dataInicio: aluguel.dataInicio,
          dataFim: aluguel.dataFim,
          valorTotal: aluguel.valorTotal,
          status: 'ativo',
        });
      }
    });

    // Adicionar aluguéis finalizados
    alugueisFinalizados.forEach((aluguel) => {
      const cliente = clientes.find(c => c.id === aluguel.clienteId);
      const moto = motos.find(m => m.id === String(aluguel.motoId));
      lista.push({
        id: `finalizado-${aluguel.id}`,
        nome: cliente?.nome || aluguel.clienteNome || 'Cliente não encontrado',
        cpf: cliente?.cpf || aluguel.clienteCpf || '',
        telefone: cliente?.telefone || aluguel.clienteTelefone || '',
        moto: moto ? `${moto.brand} ${moto.model}` : aluguel.motoNome || 'Moto não encontrada',
        dataInicio: aluguel.dataInicio,
        dataFim: aluguel.dataFim,
        valorTotal: aluguel.valorTotal,
        status: 'finalizado',
      });
    });

    return lista;
  }, [alugueisAtivos, alugueisFinalizados, motos, clientes]);

  // Função para abrir modal de entrega
  const handleEntrega = (motoId: string, motoNome: string, clienteNome: string, valorTotal: number, dataInicio: string, dataFim: string) => {
    setEntregaData({ motoId, motoNome, clienteNome, valorTotal, dataInicio, dataFim });
    setShowEntregaModal(true);
  };

  // Função para confirmar entrega
  const confirmarEntrega = () => {
    if (!entregaData) return;
    
    try {
      finalizarAluguel(entregaData.motoId);
      setShowEntregaModal(false);
      setEntregaData(null);
      Alert.alert('✅ Sucesso', 'Entrega registrada com sucesso!\nA moto está disponível para locação.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a entrega.');
    }
  };

  // Calcular dias restantes
  const calcularDiasRestantes = (dataFimStr: string) => {
    const [dia, mes, ano] = dataFimStr.split('/').map(Number);
    const dataFim = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Calcular total de dias do aluguel
  const calcularTotalDias = (dataInicioStr: string, dataFimStr: string) => {
    const [diaI, mesI, anoI] = dataInicioStr.split('/').map(Number);
    const [diaF, mesF, anoF] = dataFimStr.split('/').map(Number);
    const inicio = new Date(anoI, mesI - 1, diaI);
    const fim = new Date(anoF, mesF - 1, diaF);
    const diff = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Estatísticas de aluguéis calculadas com dados reais
  const estatisticas = React.useMemo(() => {
    const alugueisAtivosCount = Object.keys(alugueisAtivos).length;
    const alugueisFinalizadosCount = alugueisFinalizados.length;
    const totalAlugueis = alugueisAtivosCount + alugueisFinalizadosCount;
    
    const receitaAtivos = Object.values(alugueisAtivos).reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const receitaFinalizados = alugueisFinalizados.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const receitaTotal = receitaAtivos + receitaFinalizados;
    
    const ticketMedio = totalAlugueis > 0 ? receitaTotal / totalAlugueis : 0;

    return {
      totalAlugueis,
      alugueisAtivos: alugueisAtivosCount,
      alugueisFinalizados: alugueisFinalizadosCount,
      receitaMensal: receitaTotal,
      ticketMedio,
    };
  }, [alugueisAtivos, alugueisFinalizados]);

  const generateHtmlReport = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório LocMoto</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #E67E22;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #E67E22;
              margin: 0;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #8B5A2B;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .stat-box .value {
              font-size: 24px;
              font-weight: bold;
              color: #E67E22;
            }
            .stat-box .label {
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #E67E22;
              color: white;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .status-ativo {
              color: #27ae60;
              font-weight: bold;
            }
            .status-finalizado {
              color: #666;
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
            <p>Relatório de Aluguéis</p>
            <p>Gerado em: ${dataAtual}</p>
          </div>

          <div class="section">
            <h2>Resumo Geral</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="value">${estatisticas.totalAlugueis}</div>
                <div class="label">Total de Aluguéis</div>
              </div>
              <div class="stat-box">
                <div class="value">${estatisticas.alugueisAtivos}</div>
                <div class="label">Aluguéis Ativos</div>
              </div>
              <div class="stat-box">
                <div class="value">${estatisticas.alugueisFinalizados}</div>
                <div class="label">Finalizados</div>
              </div>
              <div class="stat-box">
                <div class="value">R$ ${estatisticas.receitaMensal.toLocaleString('pt-BR')}</div>
                <div class="label">Receita Mensal</div>
              </div>
              <div class="stat-box">
                <div class="value">R$ ${estatisticas.ticketMedio.toFixed(2)}</div>
                <div class="label">Ticket Médio</div>
              </div>
              <div class="stat-box">
                <div class="value">${motosDisponiveis.length}</div>
                <div class="label">Motos Disponíveis</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Clientes com Aluguel</h2>
            <table>
              <tr>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Moto</th>
                <th>Período</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
              ${clientesComAluguel.map(cliente => `
                <tr>
                  <td>${cliente.nome}</td>
                  <td>${cliente.cpf}</td>
                  <td>${cliente.moto}</td>
                  <td>${cliente.dataInicio} - ${cliente.dataFim}</td>
                  <td>R$ ${cliente.valorTotal.toFixed(2)}</td>
                  <td class="status-${cliente.status}">${cliente.status === 'ativo' ? 'Ativo' : 'Finalizado'}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Motos Disponíveis</h2>
            <table>
              <tr>
                <th>Modelo</th>
                <th>Ano</th>
                <th>Cilindrada</th>
                <th>Diária</th>
                <th>Avaliação</th>
              </tr>
              ${motosDisponiveis.map(moto => `
                <tr>
                  <td>${moto.brand} ${moto.model}</td>
                  <td>${moto.year}</td>
                  <td>${moto.specs.cc}cc</td>
                  <td>R$ ${moto.dailyRate.toFixed(2)}</td>
                  <td>⭐ ${moto.rating}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="footer">
            <p>LocMoto - Aluguel de Motos</p>
            <p>Rua 7 de Maio, Chã do Pilar - Pilar, AL</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      const html = generateHtmlReport();
      const { uri } = await Print.printToFileAsync({ html });
      Alert.alert('Sucesso', 'Relatório PDF gerado com sucesso!');
      return uri;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o relatório.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    setIsGenerating(true);
    try {
      const html = generateHtmlReport();
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Relatório LocMoto',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Atenção', 'Compartilhamento não disponível neste dispositivo.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o relatório.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderResumo = () => (
    <View style={styles.resumoContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={28} color={Colors.shared.primary} />
          <Text style={styles.statValue}>{estatisticas.totalAlugueis}</Text>
          <Text style={styles.statLabel}>Total Aluguéis</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={28} color="#27ae60" />
          <Text style={styles.statValue}>{estatisticas.alugueisAtivos}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="archive" size={28} color={Colors.shared.gray} />
          <Text style={styles.statValue}>{estatisticas.alugueisFinalizados}</Text>
          <Text style={styles.statLabel}>Finalizados</Text>
        </View>
      </View>

      <View style={styles.financeCard}>
        <Text style={styles.financeTitle}>Receita Mensal</Text>
        <Text style={styles.financeValue}>
          R$ {estatisticas.receitaMensal.toLocaleString('pt-BR')}
        </Text>
        <View style={styles.financeRow}>
          <View style={styles.financeItem}>
            <Text style={styles.financeItemLabel}>Ticket Médio</Text>
            <Text style={styles.financeItemValue}>R$ {estatisticas.ticketMedio.toFixed(2)}</Text>
          </View>
          <View style={styles.financeItem}>
            <Text style={styles.financeItemLabel}>Motos Disponíveis</Text>
            <Text style={styles.financeItemValue}>{motosDisponiveis.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderClientes = () => (
    <View style={styles.listContainer}>
      {clientesComAluguel.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={Colors.shared.gray} />
          <Text style={styles.emptyText}>Nenhum aluguel registrado</Text>
        </View>
      ) : (
        clientesComAluguel.map((cliente) => (
          <View key={cliente.id} style={styles.clienteCard}>
            <View style={styles.clienteHeader}>
              <View style={styles.clienteAvatar}>
                <Ionicons name="person" size={24} color={Colors.shared.primary} />
              </View>
              <View style={styles.clienteInfo}>
                <Text style={styles.clienteNome}>{cliente.nome}</Text>
                <Text style={styles.clienteCpf}>{cliente.cpf}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                cliente.status === 'ativo' ? styles.statusAtivo : styles.statusFinalizado
              ]}>
                <Text style={styles.statusText}>
                  {cliente.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                </Text>
              </View>
            </View>
            <View style={styles.clienteDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="bicycle" size={16} color={Colors.shared.gray} />
                <Text style={styles.detailText}>{cliente.moto}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color={Colors.shared.gray} />
                <Text style={styles.detailText}>{cliente.dataInicio} - {cliente.dataFim}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call" size={16} color={Colors.shared.gray} />
                <Text style={styles.detailText}>{cliente.telefone}</Text>
              </View>
            </View>
            <View style={styles.clienteFooter}>
              <Text style={styles.valorLabel}>Valor Total</Text>
              <Text style={styles.valorTotal}>R$ {cliente.valorTotal.toFixed(2)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderMotos = () => (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>Motos Disponíveis ({motosDisponiveis.length})</Text>
      {motosDisponiveis.map((moto) => (
        <View key={moto.id} style={styles.motoCard}>
          <View style={styles.motoInfo}>
            <Text style={styles.motoNome}>{moto.brand} {moto.model}</Text>
            <Text style={styles.motoSpecs}>{moto.year} • {moto.specs.cc}cc • {moto.specs.transmission}</Text>
          </View>
          <View style={styles.motoRight}>
            <Text style={styles.motoDiaria}>R$ {moto.dailyRate}/dia</Text>
            <View style={styles.disponivel}>
              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              <Text style={styles.disponivelText}>Disponível</Text>
            </View>
          </View>
        </View>
      ))}

      {motosAlugadas.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Motos Alugadas ({motosAlugadas.length})
          </Text>
          {motosAlugadas.map((moto) => (
            <View key={moto.id} style={[styles.motoCard, styles.motoAlugada]}>
              <View style={styles.motoInfo}>
                <Text style={styles.motoNome}>{moto.brand} {moto.model}</Text>
                <Text style={styles.motoSpecs}>{moto.year} • {moto.specs.cc}cc • {moto.specs.transmission}</Text>
              </View>
              <View style={styles.motoRight}>
                <Text style={styles.motoDiaria}>R$ {moto.dailyRate}/dia</Text>
                <View style={styles.alugada}>
                  <Ionicons name="close-circle" size={16} color={Colors.shared.primary} />
                  <Text style={styles.alugadaText}>Alugada</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const renderLocadas = () => (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>Motos Locadas ({alugueisAtivosDB.length})</Text>
      
      {alugueisAtivosDB.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bicycle-outline" size={64} color={Colors.shared.gray} />
          <Text style={styles.emptyText}>Nenhuma moto locada no momento</Text>
        </View>
      ) : (
        alugueisAtivosDB.map((aluguel) => {
          const moto = motos.find(m => m.id === String(aluguel.motoId));
          const diasRestantes = calcularDiasRestantes(aluguel.dataFim);
          const totalDias = calcularTotalDias(aluguel.dataInicio, aluguel.dataFim);
          
          return (
            <View key={aluguel.id} style={styles.locadaCard}>
              <View style={styles.locadaHeader}>
                <View style={styles.locadaMotoInfo}>
                  <Text style={styles.locadaMotoNome}>{aluguel.motoNome}</Text>
                  <Text style={styles.locadaPlaca}>Placa: {moto?.plate || 'Não informada'}</Text>
                </View>
                <View style={[
                  styles.diasBadge,
                  diasRestantes <= 1 ? styles.diasUrgente : 
                  diasRestantes <= 3 ? styles.diasAlerta : styles.diasNormal
                ]}>
                  <Text style={styles.diasBadgeText}>
                    {diasRestantes > 0 ? `${diasRestantes} dia(s)` : diasRestantes === 0 ? 'Hoje' : 'Atrasado'}
                  </Text>
                </View>
              </View>

              {aluguel ? (
                <>
                  <View style={styles.locadaClienteRow}>
                    <Ionicons name="person" size={18} color={Colors.shared.primary} />
                    <Text style={styles.locadaClienteNome}>{aluguel.clienteNome}</Text>
                  </View>
                  
                  <View style={styles.locadaDetailsGrid}>
                    <View style={styles.locadaDetailItem}>
                      <Text style={styles.locadaDetailLabel}>Início</Text>
                      <Text style={styles.locadaDetailValue}>{aluguel.dataInicio}</Text>
                    </View>
                    <View style={styles.locadaDetailItem}>
                      <Text style={styles.locadaDetailLabel}>Fim</Text>
                      <Text style={styles.locadaDetailValue}>{aluguel.dataFim}</Text>
                    </View>
                    <View style={styles.locadaDetailItem}>
                      <Text style={styles.locadaDetailLabel}>Total</Text>
                      <Text style={styles.locadaDetailValue}>{totalDias} dias</Text>
                    </View>
                    <View style={styles.locadaDetailItem}>
                      <Text style={styles.locadaDetailLabel}>Faltam</Text>
                      <Text style={[
                        styles.locadaDetailValue,
                        diasRestantes <= 1 && styles.textUrgente
                      ]}>
                        {diasRestantes > 0 ? `${diasRestantes} dias` : diasRestantes === 0 ? 'Hoje!' : 'Atrasado!'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locadaFooter}>
                    <Text style={styles.locadaTelefone}>
                      <Ionicons name="call" size={14} color={Colors.shared.gray} /> {aluguel.clienteTelefone}
                    </Text>
                    <Text style={styles.locadaValor}>R$ {aluguel.valorTotal.toFixed(2)}</Text>
                  </View>

                  {/* Botão de Entrega */}
                  <TouchableOpacity
                    style={styles.entregaButton}
                    onPress={() => handleEntrega(
                      String(aluguel.motoId), 
                      aluguel.motoNome || 'Moto', 
                      aluguel.clienteNome || 'Cliente',
                      aluguel.valorTotal,
                      aluguel.dataInicio,
                      aluguel.dataFim
                    )}
                  >
                    <Ionicons name="checkmark-done-circle" size={20} color="#FFF" />
                    <Text style={styles.entregaButtonText}>Registrar Entrega</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.semInfoContainer}>
                  <Text style={styles.semInfoText}>Dados do aluguel não disponíveis</Text>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'resumo' && styles.tabActive]}
          onPress={() => setSelectedTab('resumo')}
        >
          <Text style={[styles.tabText, selectedTab === 'resumo' && styles.tabTextActive]}>
            Resumo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'locadas' && styles.tabActive]}
          onPress={() => setSelectedTab('locadas')}
        >
          <Text style={[styles.tabText, selectedTab === 'locadas' && styles.tabTextActive]}>
            Locadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'clientes' && styles.tabActive]}
          onPress={() => setSelectedTab('clientes')}
        >
          <Text style={[styles.tabText, selectedTab === 'clientes' && styles.tabTextActive]}>
            Clientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'motos' && styles.tabActive]}
          onPress={() => setSelectedTab('motos')}
        >
          <Text style={[styles.tabText, selectedTab === 'motos' && styles.tabTextActive]}>
            Motos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {selectedTab === 'resumo' && renderResumo()}
        {selectedTab === 'locadas' && renderLocadas()}
        {selectedTab === 'clientes' && renderClientes()}
        {selectedTab === 'motos' && renderMotos()}
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <Button
          title={isGenerating ? "Gerando..." : "Gerar Relatório PDF"}
          onPress={handleGeneratePdf}
          variant="primary"
          size="large"
          icon={<Ionicons name="document" size={20} color="#FFF" />}
          style={styles.actionButton}
          disabled={isGenerating}
        />
        <Button
          title={isGenerating ? "Aguarde..." : "Compartilhar PDF"}
          onPress={handleSharePdf}
          variant="outline"
          size="large"
          icon={<Ionicons name="share-outline" size={20} color={Colors.shared.primary} />}
          style={styles.actionButton}
          disabled={isGenerating}
        />
      </View>

      {/* Modal de Confirmação de Entrega */}
      <Modal
        visible={showEntregaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEntregaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="bicycle" size={32} color="#FFF" />
              </View>
              <Text style={styles.modalTitle}>Confirmar Entrega</Text>
              <Text style={styles.modalSubtitle}>Verifique os dados antes de confirmar</Text>
            </View>

            {/* Conteúdo do Modal */}
            {entregaData && (
              <View style={styles.modalContent}>
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="bicycle" size={20} color={Colors.shared.primary} />
                    <View style={styles.modalInfoTexts}>
                      <Text style={styles.modalInfoLabel}>Moto</Text>
                      <Text style={styles.modalInfoValue}>{entregaData.motoNome}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalDivider} />
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="person" size={20} color={Colors.shared.primary} />
                    <View style={styles.modalInfoTexts}>
                      <Text style={styles.modalInfoLabel}>Cliente</Text>
                      <Text style={styles.modalInfoValue}>{entregaData.clienteNome}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalDivider} />
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar" size={20} color={Colors.shared.primary} />
                    <View style={styles.modalInfoTexts}>
                      <Text style={styles.modalInfoLabel}>Período</Text>
                      <Text style={styles.modalInfoValue}>{entregaData.dataInicio} - {entregaData.dataFim}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalDivider} />
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="cash" size={20} color={Colors.shared.primary} />
                    <View style={styles.modalInfoTexts}>
                      <Text style={styles.modalInfoLabel}>Valor Total</Text>
                      <Text style={styles.modalInfoValueHighlight}>R$ {entregaData.valorTotal.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalWarning}>
                  <Ionicons name="information-circle" size={20} color="#F59E0B" />
                  <Text style={styles.modalWarningText}>
                    Ao confirmar, a moto ficará disponível para novas locações.
                  </Text>
                </View>
              </View>
            )}

            {/* Botões do Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowEntregaModal(false);
                  setEntregaData(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={confirmarEntrega}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.modalButtonConfirmText}>Confirmar Entrega</Text>
              </TouchableOpacity>
            </View>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.shared.cardBg,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: Colors.shared.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.shared.gray,
  },
  tabTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Resumo
  resumoContainer: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  financeCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 20,
  },
  financeTitle: {
    fontSize: 14,
    color: Colors.shared.gray,
    marginBottom: 4,
  },
  financeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.shared.primary,
    marginBottom: 16,
  },
  financeRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
    paddingTop: 16,
  },
  financeItem: {
    flex: 1,
  },
  financeItemLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
  },
  financeItemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  // Clientes
  listContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  clienteCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clienteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(230, 126, 34, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clienteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  clienteCpf: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAtivo: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
  },
  statusFinalizado: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  clienteDetails: {
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3D3D3D',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.shared.gray,
  },
  clienteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  valorLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
  },
  valorTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  // Motos
  motoCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motoAlugada: {
    opacity: 0.7,
  },
  motoInfo: {
    flex: 1,
  },
  motoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  motoSpecs: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginTop: 4,
  },
  motoRight: {
    alignItems: 'flex-end',
  },
  motoDiaria: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.shared.primary,
  },
  disponivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  disponivelText: {
    fontSize: 12,
    color: '#27ae60',
  },
  alugada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  alugadaText: {
    fontSize: 12,
    color: Colors.shared.primary,
  },
  // Estilos Locadas
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.shared.gray,
    marginTop: 16,
  },
  locadaCard: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.shared.primary,
  },
  locadaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locadaMotoInfo: {
    flex: 1,
  },
  locadaMotoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  locadaPlaca: {
    fontSize: 14,
    color: Colors.shared.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  diasBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  diasNormal: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
  },
  diasAlerta: {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
  },
  diasUrgente: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  diasBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  locadaClienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  locadaClienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  locadaDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  locadaDetailItem: {
    width: '25%',
    marginBottom: 8,
  },
  locadaDetailLabel: {
    fontSize: 11,
    color: Colors.shared.gray,
    marginBottom: 2,
  },
  locadaDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  textUrgente: {
    color: '#e74c3c',
  },
  locadaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  locadaTelefone: {
    fontSize: 13,
    color: Colors.shared.gray,
  },
  locadaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.shared.primary,
  },
  entregaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  entregaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  semInfoContainer: {
    paddingVertical: 12,
  },
  semInfoText: {
    fontSize: 14,
    color: Colors.shared.gray,
    fontStyle: 'italic',
  },
  // Botões de Ação
  actionButtons: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  actionButton: {
    width: '100%',
  },
  // Estilos do Modal de Entrega
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.shared.cardBg,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: Colors.shared.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalContent: {
    padding: 20,
  },
  modalInfoCard: {
    backgroundColor: Colors.shared.darkBg,
    borderRadius: 12,
    padding: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalInfoTexts: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: Colors.shared.gray,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  modalInfoValueHighlight: {
    fontSize: 18,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 12,
  },
  modalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  modalWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3D3D3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalButtonConfirm: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
