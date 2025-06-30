const express = require("express")
const ProdutosRotas = express.Router();
const ProdutosController = require("../controllers/ProdutosController");

const produtosController = new ProdutosController();

ProdutosRotas.get("/v1/product/search", produtosController.search.bind(produtosController));
ProdutosRotas.get("/v1/product/:id", produtosController.consultarPorId.bind(produtosController));
ProdutosRotas.post("/v1/product", produtosController.criar.bind(produtosController));
ProdutosRotas.put("/v1/product/:id", produtosController.atualizar.bind(produtosController));
ProdutosRotas.delete("/v1/product/:id", produtosController.deletar.bind(produtosController));


module.exports = ProdutosRotas;