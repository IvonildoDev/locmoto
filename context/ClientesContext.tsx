import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
    ClienteDB,
    deleteCliente as deleteClienteDB,
    getAllClientes,
    initDatabase,
    insertCliente,
    searchClientesByNome,
    updateCliente as updateClienteDB
} from '../database/database';

interface ClientesContextType {
  clientes: ClienteDB[];
  loading: boolean;
  addCliente: (cliente: ClienteDB) => number;
  updateCliente: (id: number, cliente: Partial<ClienteDB>) => void;
  deleteCliente: (id: number) => void;
  searchClientes: (term: string) => ClienteDB[];
  refreshClientes: () => void;
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<ClienteDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar banco e carregar clientes
    try {
      initDatabase();
      loadClientes();
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
    }
  }, []);

  const loadClientes = () => {
    try {
      const data = getAllClientes();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCliente = (cliente: ClienteDB): number => {
    try {
      const id = insertCliente(cliente);
      loadClientes();
      return id;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const updateCliente = (id: number, cliente: Partial<ClienteDB>) => {
    try {
      updateClienteDB(id, cliente);
      loadClientes();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteCliente = (id: number) => {
    try {
      deleteClienteDB(id);
      loadClientes();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  };

  const searchClientes = (term: string): ClienteDB[] => {
    if (term.length < 3) return [];
    try {
      return searchClientesByNome(term);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  };

  const refreshClientes = () => {
    loadClientes();
  };

  return (
    <ClientesContext.Provider value={{ 
      clientes, 
      loading,
      addCliente, 
      updateCliente, 
      deleteCliente,
      searchClientes,
      refreshClientes
    }}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (context === undefined) {
    throw new Error('useClientes must be used within a ClientesProvider');
  }
  return context;
}
