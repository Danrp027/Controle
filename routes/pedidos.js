const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/clientes/buscar', (req, res) => {
  const termo = `%${req.query.nome}%`;
  const sql = `SELECT id, nome FROM clientes WHERE nome LIKE ? LIMIT 10`;
  db.all(sql, [termo], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar clientes' });
    res.json(rows);
  });
});


router.get('/produtos/buscar', (req, res) => {
  const termo = `%${req.query.nome}%`;
  const sql = `SELECT id, nome, preco_venda FROM produtos WHERE nome LIKE ? LIMIT 10`;
  db.all(sql, [termo], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    res.json(rows);
  });
});


router.post('/pedidos', (req, res) => {
  const { cliente_id, pago, data, observacoes, itens } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Pedido sem itens' });
  }

  // Gerar número único do pedido
  const numero_pedido = `PED-${Date.now()}`;

  const insertPedido = `
    INSERT INTO pedidos (numero_pedido, cliente_id, data, total, pago, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const total = itens.reduce((soma, item) => soma + item.quantidade * item.preco_unitario, 0);

  db.run(insertPedido, [numero_pedido, cliente_id || null, data, total, pago, observacoes], function (err) {
    if (err) {
      console.error('Erro ao salvar pedido:', err);
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

    itens.forEach(item => {
      insertItem.run(pedido_id, item.produto_id, item.quantidade, item.preco_unitario);
      updateEstoque.run(item.produto_id, item.quantidade, data, `Pedido ${numero_pedido}`);
    });

    insertItem.finalize();
    updateEstoque.finalize();

    res.json({ msg: 'Pedido criado com sucesso!', pedido_id, numero_pedido });
  });
});


module.exports = router;
