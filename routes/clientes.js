const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');


// Listar Clientes
router.get("/", (req, res) => {
  const query = "SELECT * FROM clientes";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar cliente:", err);
      return res.status(500).send("Erro ao buscar cliente.");
    }

    res.json(rows); 
  });
});


//Adicionar Cliente
router.post("/", (req, res) => {
  const { nome, tipo, telefone, endereco, observacoes } = req.body;

  const query = `
    INSERT INTO clientes (nome, tipo, telefone, endereco, observacoes)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [nome, tipo, telefone, endereco, observacoes],
    (err) => {
      if (err) {
        console.error("Erro ao inserir cliente:", err);
        return res
          .status(500)
          .send("Ocorreu um erro ao tentar inserir o cliente. Verifique os dados e tente novamente.");
      }
      res.send("cliente inserido com sucesso!");
    }
  );
});


//Atualizar Cliente
router.put('/:id', (req, res) => {
  const { nome, tipo, telefone, endereco, observacoes } = req.body;
  const id = req.params.id;

  db.run(
    'UPDATE clientes SET nome = ?, tipo = ?, telefone = ?, endereco = ?, observacoes = ? WHERE id = ?',
    [nome, tipo, telefone, endereco, observacoes, id],
    function (err) {
      if (err) {
        return res.status(500).send('Erro ao atualizar cliente');
      }
      res.send('Cliente atualizado com sucesso');
    }
  );
});


router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send('Erro no servidor');
    } else if (!row) {
      res.status(404).send('Cliente não encontrado');
    } else {
      res.json(row);
    }
  });
});


// Deletar Cliente
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM clientes WHERE id = ?";

  db.run(query, [id], (err) => {
    if (err) {
      console.error("Erro ao deletar cliente:", err);
      return res
        .status(500)
        .send("Erro ao deletar cliente. Verifique o código e tente novamente.");
    }
    res.send("Cliente deletado com sucesso!");
  });
});


// Buscar Produto Pelo Id 
router.get("/:id", (req, res) => {

  const { id } = req.params;

  const query = `
    SELECT * FROM clientes WHERE id = ?
  `;

  db.get(query, [id], (err) => {
    if (err) {
      console.error("Erro ao buscar cliente:", err);
      return res
        .status(500)
        .send("Erro ao buscar cliente. Verifique o código e tente novamente.");
    }
    res.json(rows);
  });
});

// Total de clientes
router.get('/relatorios/clientes/total', (req, res) => {
  db.get('SELECT COUNT(*) AS total FROM clientes', [], (err, row) => {
    if (err) return res.status(500).json({ erro: 'Erro ao contar clientes' });
    res.json(row);
  });
});

// Clientes por tipo
router.get('/relatorios/clientes/por-tipo', (req, res) => {
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

// Distribuição por bairro (exemplo: você pode adaptar para cidade)
router.get('/relatorios/clientes/por-bairro', (req, res) => {
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
