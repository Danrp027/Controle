const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');

router.post('/estoque', (req, res) => {
  const { produto_id, tipo, quantidade, data, motivo } = req.body;

  const query = `
    INSERT INTO estoque (produto_id, tipo, quantidade, data, motivo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [produto_id, tipo, quantidade, data, motivo], function(err) {
    if (err) {
      console.error('Erro ao registrar movimentação:', err);
      return res.status(500).json({ erro: 'Erro ao registrar movimentação' });
    }
    res.status(201).json({ id: this.lastID });
  });
});


router.get('/estoque', (req, res) => {
  const query = `
    SELECT estoque.*, produtos.nome AS produto_nome 
    FROM estoque 
    JOIN produtos ON estoque.produto_id = produtos.id
    ORDER BY data DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao listar movimentações:', err);
      return res.status(500).json({ erro: 'Erro ao listar movimentações' });
    }
    res.json(rows);
  });
});

router.get('/api/produtos/pesquisar', (req, res) => {
  const termo = req.query.nome || '';
  const query = `SELECT id, nome FROM produtos WHERE nome LIKE ? LIMIT 10`;
  db.all(query, [`%${termo}%`], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    res.json(rows);
  });
});

router.get('/api/produtos/buscar', (req, res) => {
  const termo = `%${req.query.nome}%`;
  const query = `SELECT id, nome FROM produtos WHERE nome LIKE ? LIMIT 10`;

  db.all(query, [termo], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
    res.json(rows);
  });
});


router.post('/api/estoque', (req, res) => {
  const { produto_id, tipo, quantidade, data, motivo } = req.body;
  const query = `INSERT INTO estoque (produto_id, tipo, quantidade, data, motivo) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [produto_id, tipo, quantidade, data, motivo], function(err) {
    if (err) return res.status(500).json({ erro: 'Erro ao registrar movimentação' });
    res.send('Movimentação registrada');
  });
});

// Exemplo: GET /api/produtos/buscar?nome=queijo
router.get('/api/produtos/buscar', (req, res) => {
  const termo = `%${req.query.nome}%`;
  const query = `
    SELECT id, nome 
    FROM produtos 
    WHERE nome LIKE ?
    ORDER BY nome
    LIMIT 10
  `;
  db.all(query, [termo], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produtos:", err);
      return res.status(500).json({ erro: "Erro ao buscar produtos" });
    }
    res.json(rows);
  });
});




module.exports = router;
