import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '../../../renovacalcados.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDb(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      chave TEXT PRIMARY KEY,
      valor TEXT,
      atualizado_em TEXT
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK(perfil IN ('admin','atendente','sapateiro')),
      ativo INTEGER DEFAULT 1,
      criado_em TEXT NOT NULL,
      ultimo_acesso TEXT,
      tentativas_falha INTEGER DEFAULT 0,
      bloqueado_ate TEXT
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      whatsapp_consentimento INTEGER DEFAULT 0,
      whatsapp_consentimento_data TEXT,
      whatsapp_consentimento_texto TEXT,
      opt_out INTEGER DEFAULT 0,
      anonimizado INTEGER DEFAULT 0,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categorias_servico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco_padrao REAL,
      prazo_padrao_dias INTEGER DEFAULT 5,
      ativo INTEGER DEFAULT 1,
      ordem INTEGER
    );

    CREATE TABLE IF NOT EXISTS ordens_servico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocolo TEXT UNIQUE NOT NULL,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id),
      status TEXT NOT NULL DEFAULT 'aguardando',
      data_entrada TEXT NOT NULL,
      data_entrega_prevista TEXT,
      data_entrega_real TEXT,
      total REAL,
      sinal_percentual REAL DEFAULT 50,
      sinal_valor REAL,
      restante REAL,
      observacoes TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS os_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER NOT NULL REFERENCES ordens_servico(id),
      categoria_id INTEGER REFERENCES categorias_servico(id),
      descricao TEXT,
      valor REAL
    );

    CREATE TABLE IF NOT EXISTS os_fotos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER NOT NULL REFERENCES ordens_servico(id),
      caminho TEXT NOT NULL,
      ordem INTEGER,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER NOT NULL REFERENCES ordens_servico(id),
      tipo TEXT NOT NULL,
      valor REAL NOT NULL,
      forma TEXT NOT NULL,
      data TEXT NOT NULL,
      registrado_por INTEGER REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS despesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria TEXT,
      descricao TEXT,
      valor REAL NOT NULL,
      data TEXT NOT NULL,
      registrado_por INTEGER REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS fechamento_caixa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'aberto',
      total_entrada REAL,
      total_saida REAL,
      saldo REAL,
      dinheiro_contado REAL,
      diferenca REAL,
      fechado_por INTEGER REFERENCES usuarios(id),
      fechado_em TEXT,
      reaberto_por INTEGER REFERENCES usuarios(id),
      motivo_reabertura TEXT
    );

    CREATE TABLE IF NOT EXISTS feriados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data TEXT NOT NULL,
      tipo TEXT,
      recorrente INTEGER DEFAULT 1,
      ano INTEGER
    );

    CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER REFERENCES ordens_servico(id),
      cliente_id INTEGER REFERENCES clientes(id),
      tipo TEXT,
      mensagem TEXT,
      status TEXT DEFAULT 'pendente',
      tentativas INTEGER DEFAULT 0,
      enviado_em TEXT,
      erro_msg TEXT
    );

    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER REFERENCES usuarios(id),
      acao TEXT NOT NULL,
      tabela TEXT,
      registro_id INTEGER,
      dados_anteriores TEXT,
      dados_novos TEXT,
      ip TEXT,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      token TEXT UNIQUE NOT NULL,
      expira_em TEXT NOT NULL,
      criado_em TEXT NOT NULL
    );
  `)

  // Índices
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_os_protocolo ON ordens_servico(protocolo);
    CREATE INDEX IF NOT EXISTS idx_os_status ON ordens_servico(status);
    CREATE INDEX IF NOT EXISTS idx_os_data_entrada ON ordens_servico(data_entrada);
    CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
    CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
  `)

  console.log('✅ Banco de dados inicializado')
}
