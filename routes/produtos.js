const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/imagens')); // pasta onde vai salvar
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname); // Ex: 17153645789.jpg
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });


// Listar Produtos
router.get("/", (req, res) => {
  const query = `
    SELECT * FROM produtos
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar produtos:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os produtos. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

//Adicionar Produtos
router.post("/", upload.single('imagem'), (req, res) => {
  const { nome, categoria, unidade, custo, venda, validade, minimo } =
    req.body;

  const imagem = req.file ? 'imagens/' + req.file.filename : null;


  const query = `
    INSERT INTO produtos (nome, categoria, unidade, preco_custo, preco_venda, validade, imagem, estoque_minimo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [nome, categoria, unidade, custo, venda, validade, imagem, minimo],
    (err) => {
      if (err) {
        console.error("Erro ao inserir produto:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar inserir o produto. Verifique os dados e tente novamente."
          );
      }
      res.send("Produto inserido com sucesso!");
    }
  );
});

//Atualizar Produtos
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, categoria, unidade_medida, preco_custo, preco_venda, validade, estoque_minimo } =
    req.body;


  const query = `
    UPDATE produtos SET
      nome = ?, categoria = ?, unidade_medida = ?,
      preco_custo = ?, preco_venda = ?, validade = ?,
      estoque_minimo = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [nome, categoria, unidade_medida, preco_custo, preco_venda, validade, estoque_minimo, id],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar produto:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar atualizar o produto. Verifique os dados e tente novamente."
          );
      }
      res.send("Produto atualizado com sucesso!");
    }
  );
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
