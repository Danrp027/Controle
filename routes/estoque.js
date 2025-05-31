// arquivo: routes/estoque.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 1. GET /api/estoque/produtos - Lista de produtos para <datalist>
router.get('/produtos', (req, res) => {
  const sql = 'SELECT id, nome FROM produtos';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    res.json(rows);
  });
});

// 2. POST /api/estoque/movimentar - Inserir movimentação
router.post('/movimentar', (req, res) => {
  const { produto_id, tipo, quantidade, data, motivo } = req.body;

  if (!produto_id || !tipo || !quantidade) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  // Insere a movimentação no histórico
  const insertQuery = `
    INSERT INTO estoque (produto_id, tipo, quantidade, data, motivo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(insertQuery, [produto_id, tipo, quantidade, data || new Date().toISOString(), motivo || ''], function(err) {
    if (err) {
      console.error('Erro ao inserir movimentação:', err);
      return res.status(500).json({ erro: 'Erro ao registrar movimentação' });
    }

    // Atualiza o estoque do produto
    const operacao = tipo === 'entrada' ? '+' : '-';

    const updateQuery = `
      UPDATE produtos 
      SET quantidade = quantidade ${operacao} ? 
      WHERE id = ?
    `;

    db.run(updateQuery, [quantidade, produto_id], function(err) {
      if (err) {
        console.error('Erro ao atualizar estoque:', err);
        return res.status(500).json({ erro: 'Movimentação registrada, mas erro ao atualizar estoque' });
      }

      res.json({ mensagem: 'Movimentação registrada e estoque atualizado com sucesso!' });
    });
  });
});


// 3. GET /api/estoque/historico - Listar movimentações
router.get('/historico', (req, res) => {
  const sql = `
    SELECT p.nome, e.tipo, e.quantidade, e.data, e.motivo
    FROM estoque e
    JOIN produtos p ON e.produto_id = p.id
    ORDER BY e.data DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar histórico' });
    res.json(rows);
  });
});

// 4. GET /api/estoque/baixo - Produtos com estoque abaixo do mínimo
router.get('/baixo', (req, res) => {
  const sql = `
    SELECT nome, quantidade, estoque_minimo
    FROM produtos
    WHERE quantidade < estoque_minimo
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos com estoque baixo' });
    res.json(rows);
  });
});

// 5. GET /api/estoque/atual - Relatório de estoque atual
router.get('/atual', (req, res) => {
  const sql = `
    SELECT nome, categoria, unidade, quantidade, estoque_minimo
    FROM produtos
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar estoque atual' });
    res.json(rows);
  });
});

router.get("/atual", (req, res) => {
  const query = `
    SELECT 
      p.nome, 
      p.categoria, 
      p.quantidade AS quantidade_atual, 
      p.estoque_minimo
    FROM produtos p
    ORDER BY p.nome
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar relatório de estoque:", err);
      return res.status(500).json({ erro: "Erro ao gerar relatório de estoque" });
    }
    res.json(rows);
  });
});


module.exports = router;
 