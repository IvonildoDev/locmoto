import * as SQLite from 'expo-sqlite';

// Abrir/criar banco de dados
const db = SQLite.openDatabaseSync('locmoto.db');

// Inicializar tabelas
export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      cnh TEXT,
      telefone TEXT,
      rua TEXT,
      numero TEXT,
      complemento TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,
      cep TEXT,
      cnhImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS motos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      plate TEXT UNIQUE,
      dailyRate REAL NOT NULL,
      imageUrl TEXT,
      cc INTEGER,
      transmission TEXT,
      consumption TEXT,
      brakes TEXT,
      rating REAL DEFAULT 0,
      reviewCount INTEGER DEFAULT 0,
      description TEXT,
      available INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alugueis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motoId INTEGER NOT NULL,
      clienteId INTEGER NOT NULL,
      dataInicio TEXT NOT NULL,
      dataFim TEXT NOT NULL,
      valorDiaria REAL NOT NULL,
      valorTotal REAL NOT NULL,
      status TEXT DEFAULT 'ativo',
      contratoGerado INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (motoId) REFERENCES motos(id),
      FOREIGN KEY (clienteId) REFERENCES clientes(id)
    );
  `);
};

// ==================== CLIENTES ====================

export interface ClienteDB {
  id?: number;
  nome: string;
  cpf: string;
  cnh?: string;
  telefone?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cnhImage?: string;
  createdAt?: string;
}

// Inserir cliente
export const insertCliente = (cliente: ClienteDB): number => {
  const result = db.runSync(
    `INSERT INTO clientes (nome, cpf, cnh, telefone, rua, numero, complemento, bairro, cidade, estado, cep, cnhImage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cliente.nome,
      cliente.cpf,
      cliente.cnh || null,
      cliente.telefone || null,
      cliente.rua || null,
      cliente.numero || null,
      cliente.complemento || null,
      cliente.bairro || null,
      cliente.cidade || null,
      cliente.estado || null,
      cliente.cep || null,
      cliente.cnhImage || null,
    ]
  );
  return result.lastInsertRowId;
};

// Buscar todos os clientes
export const getAllClientes = (): ClienteDB[] => {
  return db.getAllSync('SELECT * FROM clientes ORDER BY nome ASC') as ClienteDB[];
};

// Buscar cliente por ID
export const getClienteById = (id: number): ClienteDB | null => {
  const result = db.getFirstSync('SELECT * FROM clientes WHERE id = ?', [id]) as ClienteDB | null;
  return result;
};

// Buscar clientes por nome (para autocomplete)
export const searchClientesByNome = (searchTerm: string): ClienteDB[] => {
  const term = `%${searchTerm}%`;
  return db.getAllSync(
    'SELECT * FROM clientes WHERE nome LIKE ? OR cpf LIKE ? ORDER BY nome ASC LIMIT 10',
    [term, term]
  ) as ClienteDB[];
};

// Atualizar cliente
export const updateCliente = (id: number, cliente: Partial<ClienteDB>): void => {
  const fields: string[] = [];
  const values: any[] = [];

  if (cliente.nome !== undefined) { fields.push('nome = ?'); values.push(cliente.nome); }
  if (cliente.cpf !== undefined) { fields.push('cpf = ?'); values.push(cliente.cpf); }
  if (cliente.cnh !== undefined) { fields.push('cnh = ?'); values.push(cliente.cnh); }
  if (cliente.telefone !== undefined) { fields.push('telefone = ?'); values.push(cliente.telefone); }
  if (cliente.rua !== undefined) { fields.push('rua = ?'); values.push(cliente.rua); }
  if (cliente.numero !== undefined) { fields.push('numero = ?'); values.push(cliente.numero); }
  if (cliente.complemento !== undefined) { fields.push('complemento = ?'); values.push(cliente.complemento); }
  if (cliente.bairro !== undefined) { fields.push('bairro = ?'); values.push(cliente.bairro); }
  if (cliente.cidade !== undefined) { fields.push('cidade = ?'); values.push(cliente.cidade); }
  if (cliente.estado !== undefined) { fields.push('estado = ?'); values.push(cliente.estado); }
  if (cliente.cep !== undefined) { fields.push('cep = ?'); values.push(cliente.cep); }
  if (cliente.cnhImage !== undefined) { fields.push('cnhImage = ?'); values.push(cliente.cnhImage); }

  if (fields.length > 0) {
    values.push(id);
    db.runSync(`UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`, values);
  }
};

// Deletar cliente
export const deleteCliente = (id: number): void => {
  db.runSync('DELETE FROM clientes WHERE id = ?', [id]);
};

// ==================== MOTOS ====================

export interface MotoDB {
  id?: number;
  brand: string;
  model: string;
  year?: number;
  plate?: string;
  dailyRate: number;
  imageUrl?: string;
  cc?: number;
  transmission?: string;
  consumption?: string;
  brakes?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  available?: number;
  createdAt?: string;
}

// Inserir moto
export const insertMoto = (moto: MotoDB): number => {
  const result = db.runSync(
    `INSERT INTO motos (brand, model, year, plate, dailyRate, imageUrl, cc, transmission, consumption, brakes, description, available)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      moto.brand,
      moto.model,
      moto.year || null,
      moto.plate || null,
      moto.dailyRate,
      moto.imageUrl || null,
      moto.cc || null,
      moto.transmission || null,
      moto.consumption || null,
      moto.brakes || null,
      moto.description || null,
      moto.available !== undefined ? moto.available : 1,
    ]
  );
  return result.lastInsertRowId;
};

// Buscar todas as motos
export const getAllMotos = (): MotoDB[] => {
  return db.getAllSync('SELECT * FROM motos ORDER BY createdAt DESC') as MotoDB[];
};

// Buscar moto por ID
export const getMotoById = (id: number): MotoDB | null => {
  return db.getFirstSync('SELECT * FROM motos WHERE id = ?', [id]) as MotoDB | null;
};

// Atualizar moto
export const updateMoto = (id: number, moto: Partial<MotoDB>): void => {
  const fields: string[] = [];
  const values: any[] = [];

  if (moto.brand !== undefined) { fields.push('brand = ?'); values.push(moto.brand); }
  if (moto.model !== undefined) { fields.push('model = ?'); values.push(moto.model); }
  if (moto.year !== undefined) { fields.push('year = ?'); values.push(moto.year); }
  if (moto.plate !== undefined) { fields.push('plate = ?'); values.push(moto.plate); }
  if (moto.dailyRate !== undefined) { fields.push('dailyRate = ?'); values.push(moto.dailyRate); }
  if (moto.imageUrl !== undefined) { fields.push('imageUrl = ?'); values.push(moto.imageUrl); }
  if (moto.cc !== undefined) { fields.push('cc = ?'); values.push(moto.cc); }
  if (moto.transmission !== undefined) { fields.push('transmission = ?'); values.push(moto.transmission); }
  if (moto.available !== undefined) { fields.push('available = ?'); values.push(moto.available); }

  if (fields.length > 0) {
    values.push(id);
    db.runSync(`UPDATE motos SET ${fields.join(', ')} WHERE id = ?`, values);
  }
};

// Deletar moto
export const deleteMoto = (id: number): void => {
  db.runSync('DELETE FROM motos WHERE id = ?', [id]);
};

// ==================== ALUGUÉIS ====================

export interface AluguelDB {
  id?: number;
  motoId: number;
  clienteId: number;
  dataInicio: string;
  dataFim: string;
  valorDiaria: number;
  valorTotal: number;
  status?: string;
  contratoGerado?: number;
  createdAt?: string;
  // Campos de join
  clienteNome?: string;
  clienteCpf?: string;
  clienteTelefone?: string;
  motoNome?: string;
  motoPlate?: string;
}

// Inserir aluguel
export const insertAluguel = (aluguel: AluguelDB): number => {
  const result = db.runSync(
    `INSERT INTO alugueis (motoId, clienteId, dataInicio, dataFim, valorDiaria, valorTotal, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      aluguel.motoId,
      aluguel.clienteId,
      aluguel.dataInicio,
      aluguel.dataFim,
      aluguel.valorDiaria,
      aluguel.valorTotal,
      aluguel.status || 'ativo',
    ]
  );
  
  // Atualizar disponibilidade da moto
  db.runSync('UPDATE motos SET available = 0 WHERE id = ?', [aluguel.motoId]);
  
  return result.lastInsertRowId;
};

// Buscar todos os aluguéis com dados de cliente e moto
export const getAllAlugueis = (): AluguelDB[] => {
  return db.getAllSync(`
    SELECT 
      a.*,
      c.nome as clienteNome,
      c.cpf as clienteCpf,
      c.telefone as clienteTelefone,
      m.brand || ' ' || m.model as motoNome,
      m.plate as motoPlate
    FROM alugueis a
    JOIN clientes c ON a.clienteId = c.id
    JOIN motos m ON a.motoId = m.id
    ORDER BY a.createdAt DESC
  `) as AluguelDB[];
};

// Buscar aluguéis ativos
export const getAlugueisAtivos = (): AluguelDB[] => {
  return db.getAllSync(`
    SELECT 
      a.*,
      c.nome as clienteNome,
      c.cpf as clienteCpf,
      c.telefone as clienteTelefone,
      m.brand || ' ' || m.model as motoNome,
      m.plate as motoPlate
    FROM alugueis a
    JOIN clientes c ON a.clienteId = c.id
    JOIN motos m ON a.motoId = m.id
    WHERE a.status = 'ativo'
    ORDER BY a.createdAt DESC
  `) as AluguelDB[];
};

// Buscar aluguéis finalizados
export const getAlugueisFinalizados = (): AluguelDB[] => {
  return db.getAllSync(`
    SELECT 
      a.*,
      c.nome as clienteNome,
      c.cpf as clienteCpf,
      c.telefone as clienteTelefone,
      m.brand || ' ' || m.model as motoNome,
      m.plate as motoPlate
    FROM alugueis a
    JOIN clientes c ON a.clienteId = c.id
    JOIN motos m ON a.motoId = m.id
    WHERE a.status = 'finalizado'
    ORDER BY a.createdAt DESC
  `) as AluguelDB[];
};

// Finalizar aluguel
export const finalizarAluguel = (id: number): void => {
  const aluguel = db.getFirstSync('SELECT motoId FROM alugueis WHERE id = ?', [id]) as { motoId: number } | null;
  
  if (aluguel) {
    db.runSync('UPDATE alugueis SET status = ? WHERE id = ?', ['finalizado', id]);
    db.runSync('UPDATE motos SET available = 1 WHERE id = ?', [aluguel.motoId]);
  }
};

// Buscar aluguel ativo por motoId
export const getAluguelAtivoByMotoId = (motoId: number): AluguelDB | null => {
  return db.getFirstSync(`
    SELECT a.*
    FROM alugueis a
    WHERE a.motoId = ? AND a.status = 'ativo'
    LIMIT 1
  `, [motoId]) as AluguelDB | null;
};

// Marcar contrato como gerado
export const marcarContratoGerado = (id: number): void => {
  db.runSync('UPDATE alugueis SET contratoGerado = 1 WHERE id = ?', [id]);
};

// Exportar instância do banco
export default db;
