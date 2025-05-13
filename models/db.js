const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/banco.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err);
  } else {
    console.log('Banco conectado com sucesso!');
    criarTabelas();
  }
});

function criarTabelas() {
  // Produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT,
      unidade TEXT,
      preco_custo REAL,
      preco_venda REAL,
      validade TEXT,
      imagem TEXT,
      estoque_minimo INTEGER
    )
  `);

  // Clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT, -- pessoa ou comercio
      telefone TEXT,
      endereco TEXT,
      observacoes TEXT
    )
  `);

  // Pedidos
  db.run(`
 CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_pedido TEXT UNIQUE,
  cliente_id INTEGER,
  data TEXT,
  total REAL,
  pago INTEGER, -- 1 = sim, 0 = fiado
  observacoes TEXT,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
)
  `);

  // Itens do Pedido
  db.run(`
    CREATE TABLE IF NOT EXISTS itens_pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      produto_id INTEGER,
      quantidade REAL,
      preco_unitario REAL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )
  `);

  // Movimentações de estoque
  db.run(`
    CREATE TABLE IF NOT EXISTS estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER,
      tipo TEXT, -- entrada ou saída
      quantidade REAL,
      data TEXT,
      motivo TEXT,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )
  `);

  // Controle de fiado
  db.run(`
    CREATE TABLE IF NOT EXISTS fiados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      valor REAL,
      data TEXT,
      tipo TEXT, -- "débito" ou "pagamento"
      observacoes TEXT,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);
}

module.exports = db;
