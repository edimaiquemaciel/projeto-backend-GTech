const express = require("express")
const CategoriasRotas = express.Router();
const CategoriasController = require("../controllers/CategoriasController");

const categoriasController = new CategoriasController();

CategoriasRotas.get("/v1/category/search", categoriasController.search);
CategoriasRotas.get("/v1/category/:id", categoriasController.consultaPorId);
CategoriasRotas.post("/v1/category", categoriasController.criar);
CategoriasRotas.put("/v1/category/:id", categoriasController.atualizar);
CategoriasRotas.delete("/v1/category/:id", categoriasController.deletar);


module.exports = CategoriasRotas;