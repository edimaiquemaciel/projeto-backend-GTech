const express = require("express")
const ProdutosRotas = express.Router();
const ProdutosController = require("../controllers/ProdutosController");

const produtosController = new ProdutosController();

ProdutosRotas.get("/v1/product/search", produtosController.search);
ProdutosRotas.get("/v1/product/:id", produtosController.consultarPorId);
ProdutosRotas.post("/v1/product", produtosController.criar);
ProdutosRotas.put("/v1/product/:id", produtosController.atualizar);
ProdutosRotas.delete("/v1/product/:id", produtosController.deletar);

module.exports = ProdutosRotas;