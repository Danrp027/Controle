const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Buscar clientes
router.get('/clientes/buscar', (req, res) => {
  const termo = `%${req.query.nome}%`;
  const sql = `SELECT id, nome FROM clientes WHERE nome LIKE ? LIMIT 10`;
  db.all(sql, [termo], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar clientes' });
    res.json(rows);
  });
});

// Buscar produtos
router.get('/produtos/buscar', (req, res) => {
  const termo = `%${req.query.nome}%`;
  const sql = `SELECT id, nome, preco_venda FROM produtos WHERE nome LIKE ? LIMIT 10`;
  db.all(sql, [termo], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    res.json(rows);
  });
});

// Salvar pedido
router.post('/pedidos', (req, res) => {
  const { cliente_id, pago, data, observacoes, itens } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Pedido sem itens' });
  }

  const numero_pedido = `PED-${Date.now()}`;

  const total = itens.reduce((soma, item) => soma + item.quantidade * item.preco_unitario, 0);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `
      INSERT INTO pedidos (numero_pedido, cliente_id, data, total, pago, observacoes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [numero_pedido, cliente_id || null, data, total, pago, observacoes],
      function (err) {
        if (err) {
          console.error('Erro ao salvar pedido:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ erro: 'Erro ao salvar pedido' });
        }

        const pedido_id = this.lastID;

        const insertItem = db.prepare(`
          INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
          VALUES (?, ?, ?, ?)
        `);

        const updateEstoque = db.prepare(`
          INSERT INTO estoque (produto_id, tipo, quantidade, data, motivo)
          VALUES (?, 'saida', ?, ?, ?)
        `);

        try {
          itens.forEach(item => {
            insertItem.run(pedido_id, item.produto_id, item.quantidade, item.preco_unitario);
            updateEstoque.run(item.produto_id, item.quantidade, data, `Pedido ${numero_pedido}`);
          });

          insertItem.finalize();
          updateEstoque.finalize();

          db.run('COMMIT', errCommit => {
            if (errCommit) {
              console.error('Erro no COMMIT:', errCommit);
              return res.status(500).json({ erro: 'Erro ao finalizar pedido' });
            }

            res.json({ msg: 'Pedido criado com sucesso!', pedido_id, numero_pedido });
          });
        } catch (error) {
          console.error('Erro ao salvar itens/estoque:', error);
          db.run('ROLLBACK');
          res.status(500).json({ erro: 'Erro ao salvar itens do pedido' });
        }
      }
    );
  });
});

// (Opcional) Recuperar pedido por ID — para fallback no recibo
router.get('/pedidos/:id', (req, res) => {
  const pedido_id = req.params.id;

  const sqlPedido = `SELECT * FROM pedidos WHERE id = ?`;
  const sqlItens = `
    SELECT ip.*, p.nome
    FROM itens_pedido ip
    JOIN produtos p ON ip.produto_id = p.id
    WHERE ip.pedido_id = ?
  `;
  db.get(sqlPedido, [pedido_id], (err, pedido) => {
    if (err || !pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    db.all(sqlItens, [pedido_id], (err2, itens) => {
      if (err2) {
        return res.status(500).json({ erro: 'Erro ao buscar itens do pedido' });
      }

      res.json({
        numero_pedido: pedido.numero_pedido,
        data: pedido.data,
        cliente: pedido.cliente_id || 'Cliente Avulso',
        pago: pedido.pago,
        observacoes: pedido.observacoes,
        itens: itens.map(item => ({
          nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }))
      });
    });
  });
});

module.exports = router;
