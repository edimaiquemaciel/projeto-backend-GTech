const express = require("express");
const validarToken = require("../../src/middleware/validarToken");
const UsuariosRotas = require("../../src/routes/UsuariosRotas");
const CategoriasRotas = require("../../src/routes/CategoriasRotas");
const ProdutosRotas = require("../../src/routes/ProdutosRotas");

function createTestApp() {
  const app = express();
  
  app.use(express.json());
  app.use(validarToken);
  
  app.use(UsuariosRotas);
  app.use(CategoriasRotas);
  app.use(ProdutosRotas);
  
  app.get("/", (req, res) => {
    return res.send("Teste api");
  });
  
  return app;
}

module.exports = createTestApp;