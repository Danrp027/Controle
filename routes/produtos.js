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








module.exports = router;
