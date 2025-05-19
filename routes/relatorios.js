const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Total de clientes
router.get('/clientes/total', (req, res) => {
  db.get('SELECT COUNT(*) AS total FROM clientes', [], (err, row) => {
    if (err) return res.status(500).json({ erro: 'Erro ao contar clientes' });
    res.json(row);
  });
});

// Clientes por tipo
router.get('/clientes/por-tipo', (req, res) => {
  const query = `
    SELECT tipo, COUNT(*) AS quantidade 
    FROM clientes 
    GROUP BY tipo
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao contar por tipo' });
    res.json(rows);
  });
});

// Clientes por bairro
router.get('/clientes/por-bairro', (req, res) => {
  const query = `
    SELECT endereco AS bairro, COUNT(*) AS quantidade 
    FROM clientes 
    GROUP BY endereco
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao agrupar por bairro' });
    res.json(rows);
  });
});

module.exports = router;
