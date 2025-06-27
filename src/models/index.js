const ProdutosModel = require('./ProdutosModel');
const CategoriasModel = require('./CategoriasModel');
const ProdutosCategoriaModel = require('./ProdutosCategoriaModel');
const ImagensProduto = require('./ImagensProduto');
const OpcoesProduto = require('./OpcoesProduto');
const UsuariosModel = require('./UsuariosModel');

const models = {
  ProdutosModel,
  CategoriasModel,
  ProdutosCategoriaModel,
  ImagensProduto,
  OpcoesProduto,
  UsuariosModel
};

// Executar associações após todos os modelos estarem definidos
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
