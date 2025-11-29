import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
    deleteMoto as deleteMotoDB,
    getAllAlugueis,
    getAllMotos,
    initDatabase,
    insertAluguel,
    insertMoto as insertMotoDB,
    MotoDB,
    updateMoto as updateMotoDB
} from '../database/database';
import { Motorcycle } from '../types';

// Interface para dados do cliente no aluguel
interface ClienteAluguel {
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

interface MotosContextType {
  motos: Motorcycle[];
  setMotos: React.Dispatch<React.SetStateAction<Motorcycle[]>>;
  addMoto: (moto: Motorcycle) => void;
  updateMoto: (id: string, moto: Partial<Motorcycle>) => void;
  deleteMoto: (id: string) => void;
  toggleAvailability: (id: string) => void;
  alugueisAtivos: Record<string, DadosAluguel>;
  setAlugueisAtivos: React.Dispatch<React.SetStateAction<Record<string, DadosAluguel>>>;
  registrarAluguel: (motoId: string, clienteId: number, dados: DadosAluguel) => void;
  refreshMotos: () => void;
  loading: boolean;
}

const MotosContext = createContext<MotosContextType | undefined>(undefined);

// Converter MotoDB para Motorcycle
const convertToMotorcycle = (moto: MotoDB): Motorcycle => ({
  id: moto.id?.toString() || '',
  brand: moto.brand,
  model: moto.model,
  year: moto.year || new Date().getFullYear(),
  plate: moto.plate,
  dailyRate: moto.dailyRate,
  imageUrl: moto.imageUrl || 'https://via.placeholder.com/400x200?text=Moto',
  specs: {
    cc: moto.cc || 0,
    transmission: (moto.transmission as 'Manual' | 'Automática') || 'Manual',
    consumption: moto.consumption || '',
    brakes: moto.brakes || '',
  },
  rating: moto.rating || 0,
  reviewCount: moto.reviewCount || 0,
  description: moto.description || '',
  available: moto.available === 1,
});

export function MotosProvider({ children }: { children: ReactNode }) {
  const [motos, setMotos] = useState<Motorcycle[]>([]);
  const [alugueisAtivos, setAlugueisAtivos] = useState<Record<string, DadosAluguel>>({});
  const [loading, setLoading] = useState(true);

  // Inicializar banco e carregar dados
  useEffect(() => {
    try {
      initDatabase();
      loadMotos();
      loadAlugueis();
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
    }
  }, []);

  const loadMotos = () => {
    try {
      const motosDB = getAllMotos();
      const motorcycles = motosDB.map(convertToMotorcycle);
      setMotos(motorcycles);
    } catch (error) {
      console.error('Erro ao carregar motos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlugueis = () => {
    try {
      const alugueis = getAllAlugueis();
      const ativos: Record<string, DadosAluguel> = {};
      
      alugueis.filter(a => a.status === 'ativo').forEach((aluguel) => {
        ativos[aluguel.motoId.toString()] = {
          dataInicio: aluguel.dataInicio,
          dataFim: aluguel.dataFim,
          valorTotal: aluguel.valorTotal,
          cliente: {
            nome: aluguel.clienteNome || '',
            cpf: aluguel.clienteCpf || '',
            cnh: '',
            telefone: aluguel.clienteTelefone || '',
            endereco: '',
          },
        };
      });
      
      setAlugueisAtivos(ativos);
    } catch (error) {
      console.error('Erro ao carregar alugueis:', error);
    }
  };

  const refreshMotos = () => {
    loadMotos();
    loadAlugueis();
  };

  const addMoto = (moto: Motorcycle) => {
    try {
      const newId = insertMotoDB({
        brand: moto.brand,
        model: moto.model,
        year: moto.year,
        plate: moto.plate,
        dailyRate: moto.dailyRate,
        imageUrl: moto.imageUrl,
        cc: moto.specs.cc,
        transmission: moto.specs.transmission,
        consumption: moto.specs.consumption,
        brakes: moto.specs.brakes,
        description: moto.description,
        available: moto.available ? 1 : 0,
      });
      
      // Recarregar lista de motos
      loadMotos();
    } catch (error) {
      console.error('Erro ao adicionar moto:', error);
      throw error;
    }
  };

  const updateMoto = (id: string, updates: Partial<Motorcycle>) => {
    try {
      const dbUpdates: Partial<MotoDB> = {};
      
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.model !== undefined) dbUpdates.model = updates.model;
      if (updates.year !== undefined) dbUpdates.year = updates.year;
      if (updates.plate !== undefined) dbUpdates.plate = updates.plate;
      if (updates.dailyRate !== undefined) dbUpdates.dailyRate = updates.dailyRate;
      if (updates.imageUrl !== undefined) dbUpdates.imageUrl = updates.imageUrl;
      if (updates.available !== undefined) dbUpdates.available = updates.available ? 1 : 0;
      if (updates.specs?.cc !== undefined) dbUpdates.cc = updates.specs.cc;
      if (updates.specs?.transmission !== undefined) dbUpdates.transmission = updates.specs.transmission;
      
      updateMotoDB(parseInt(id), dbUpdates);
      loadMotos();
    } catch (error) {
      console.error('Erro ao atualizar moto:', error);
      throw error;
    }
  };

  const deleteMoto = (id: string) => {
    try {
      deleteMotoDB(parseInt(id));
      loadMotos();
    } catch (error) {
      console.error('Erro ao deletar moto:', error);
      throw error;
    }
  };

  const toggleAvailability = (id: string) => {
    const moto = motos.find(m => m.id === id);
    if (moto) {
      updateMoto(id, { available: !moto.available });
    }
  };

  const registrarAluguel = (motoId: string, clienteId: number, dados: DadosAluguel) => {
    try {
      const moto = motos.find(m => m.id === motoId);
      if (!moto) throw new Error('Moto não encontrada');

      // Calcular dias
      const [diaI, mesI, anoI] = dados.dataInicio.split('/').map(Number);
      const [diaF, mesF, anoF] = dados.dataFim.split('/').map(Number);
      const inicio = new Date(anoI, mesI - 1, diaI);
      const fim = new Date(anoF, mesF - 1, diaF);
      const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

      // Inserir no banco
      insertAluguel({
        motoId: parseInt(motoId),
        clienteId,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        valorDiaria: moto.dailyRate,
        valorTotal: dados.valorTotal,
        status: 'ativo',
      });

      // Recarregar dados
      loadMotos();
      loadAlugueis();
    } catch (error) {
      console.error('Erro ao registrar aluguel:', error);
      throw error;
    }
  };

  return (
    <MotosContext.Provider value={{ 
      motos, 
      setMotos, 
      addMoto, 
      updateMoto, 
      deleteMoto, 
      toggleAvailability,
      alugueisAtivos,
      setAlugueisAtivos,
      registrarAluguel,
      refreshMotos,
      loading,
    }}>
      {children}
    </MotosContext.Provider>
  );
}

export function useMotos() {
  const context = useContext(MotosContext);
  if (context === undefined) {
    throw new Error('useMotos must be used within a MotosProvider');
  }
  return context;
}
