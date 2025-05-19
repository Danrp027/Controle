const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/imagens'));
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });


// Listar Produtos
router.get("/", (req, res) => {
  const query = "SELECT * FROM produtos";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produtos:", err);
      return res.status(500).send("Erro ao buscar produtos.");
    }

    res.json(rows); // <- Aqui sim 'rows' está definido
  });
});


//Adicionar Produtos
router.post("/", upload.single('imagem'), (req, res) => {
  const { nome, categoria, unidade, custo, venda, validade, minimo, quantidade } = req.body;

  const imagem = req.file ? 'imagens/' + req.file.filename : null;

  const query = `
    INSERT INTO produtos (nome, categoria, unidade, preco_custo, preco_venda, validade, imagem, estoque_minimo, quantidade)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [nome, categoria, unidade, custo, venda, validade, imagem, minimo, quantidade],
    (err) => {
      if (err) {
        console.error("Erro ao inserir produto:", err);
        return res
          .status(500)
          .send("Ocorreu um erro ao tentar inserir o produto. Verifique os dados e tente novamente.");
      }
      res.send("Produto inserido com sucesso!");
    }
  );
});


//Atualizar Produtos
router.put("/:id", upload.single("imagem"), (req, res) => {
  const { nome, categoria, unidade, custo, venda, validade, minimo, quantidade } = req.body;
  const id = req.params.id;
  const imagem = req.file ? "imagens/" + req.file.filename : null;

  const query = `
    UPDATE produtos SET 
      nome = ?, 
      categoria = ?, 
      unidade = ?, 
      preco_custo = ?, 
      preco_venda = ?, 
      validade = ?, 
      ${imagem ? "imagem = ?," : ""}
      estoque_minimo = ?, 
      quantidade = ?
    WHERE id = ?
  `;

  const params = imagem
    ? [nome, categoria, unidade, custo, venda, validade, imagem, minimo, quantidade, id]
    : [nome, categoria, unidade, custo, venda, validade, minimo, quantidade, id];

  db.run(query, params, (err) => {
    if (err) {
      console.error("Erro ao atualizar produto:", err);
      return res.status(500).send("Erro ao atualizar produto.");
    }
    res.send("Produto atualizado com sucesso!");
  });
});

// Buscar Produto Pelo Id 
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM produtos WHERE id = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar produto:", err);
      return res.status(500).send("Erro ao buscar produto. Verifique o código e tente novamente.");
    }

    if (!row) {
      return res.status(404).send("Produto não encontrado.");
    }

    res.json(row); // ✅ agora sim, usa 'row'
  });
});




// Deletar Produtos
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM produtos WHERE id = ?";

  db.run(query, [id], (err) => {
    if (err) {
      console.error("Erro ao deletar produto:", err);
      return res
        .status(500)
        .send("Erro ao deletar produto. Verifique o código e tente novamente.");
    }
    res.send("Produto deletado com sucesso!");
  });
});


// Buscar Produto Pelo Id 
router.get("/:id", (req, res) => {

  const { id } = req.params;

  const query = `
    SELECT * FROM produtos WHERE id = ?
  `;

  db.get(query, [id], (err) => {
    if (err) {
      console.error("Erro ao buscar produto:", err);
      return res
        .status(500)
        .send("Erro ao buscar produto. Verifique o código e tente novamente.");
    }
    res.json(rows);
  });
});

// Relatório: Produtos mais vendidos
router.get('/relatorios/mais-vendidos', (req, res) => {
  const query = `
    SELECT 
      produtos.nome, 
      SUM(vendas.quantidade_vendida) AS total_vendido
    FROM 
      vendas
    JOIN 
      produtos ON produtos.id = vendas.produto_id
    GROUP BY 
      produtos.id
    ORDER BY 
      total_vendido DESC
    LIMIT 10
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar mais vendidos:', err);
      return res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
    res.json(rows);
  });
});

// Relatório: Produtos menos vendidos
router.get('/relatorios/menos-vendidos', (req, res) => {
  const query = `
    SELECT 
      produtos.nome, 
      COALESCE(SUM(vendas.quantidade_vendida), 0) AS total_vendido
    FROM 
      produtos
    LEFT JOIN 
      vendas ON produtos.id = vendas.produto_id
    GROUP BY 
      produtos.id
    ORDER BY 
      total_vendido ASC
    LIMIT 10
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar menos vendidos:', err);
      return res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
    res.json(rows);
  });
});


// GET /api/produtos/relatorios/estoque-baixo
router.get('/relatorios/estoque-baixo', (req, res) => {
  const sql = `
    SELECT nome, categoria, quantidade AS quantidade_atual, estoque_minimo
    FROM produtos
    WHERE quantidade < estoque_minimo
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao buscar produtos com estoque baixo' });
    } else {
      res.json(rows);
    }
  });
});

router.get("/relatorios/vencidos", async (req, res) => {
  
const sql = `
   SELECT nome, categoria, validade
    FROM produtos
    WHERE DATE(validade) <= DATE('now', '+15 day')
    ORDER BY validade ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao buscar produtos Vencido ou Proximos' });
    } else {
      res.json(rows);
    }
  });
});

// Rota de busca por nome para autocomplete
router.get('/buscar', (req, res) => {
  const nome = `%${req.query.nome}%`;

  const query = `
    SELECT id, nome
    FROM produtos
    WHERE nome LIKE ?
    ORDER BY nome ASC
    LIMIT 10
  `;

  db.all(query, [nome], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produtos por nome:", err);
      return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }

    res.json(rows);
  });
});



module.exports = router;
