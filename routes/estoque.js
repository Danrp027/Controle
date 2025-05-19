const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');






// GET /estoque/atual
router.get('/estoque/atual', async (req, res) => {
  try {
    const produtos = await db.all(`
      SELECT id, nome, quantidade_estoque, estoque_minimo,
        CASE WHEN quantidade_estoque <= estoque_minimo THEN 1 ELSE 0 END AS alerta
      FROM produtos
    `);
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estoque atual.' });
  }
});


router.post('/estoque/movimentar', async (req, res) => {
  const { produto_id, tipo, quantidade, motivo } = req.body;

  if (!produto_id || !tipo || !quantidade) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const data = new Date().toISOString().split('T')[0]; // data no formato YYYY-MM-DD

    await db.run(`
      INSERT INTO estoque (produto_id, tipo, quantidade, data, motivo)
      VALUES (?, ?, ?, ?, ?)
    `, [produto_id, tipo, quantidade, data, motivo]);

    res.json({ success: true, message: 'Movimentação registrada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar movimentação' });
  }
});

router.get('/estoque/historico', async (req, res) => {
  try {
    const historico = await db.all(`
      SELECT e.*, p.nome AS nome_produto 
      FROM estoque e 
      JOIN produtos p ON p.id = e.produto_id
      ORDER BY e.data DESC
    `);

    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});






module.exports = router;
