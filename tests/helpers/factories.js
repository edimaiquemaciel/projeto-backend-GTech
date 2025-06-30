const UsuariosModel = require("../../src/models/UsuariosModel");
const CategoriasModel = require("../../src/models/CategoriasModel");
const ProdutosModel = require("../../src/models/ProdutosModel");
const jwt = require("jsonwebtoken");

class TestFactories {
  static async createUser(data = {}) {
    const defaultData = {
      firstname: "João",
      surname: "Silva",
      email: `teste${Date.now()}@example.com`,
      password: "senha123456"
    };
    
    return await UsuariosModel.create({ ...defaultData, ...data });
  }
  
  static async createCategory(data = {}) {
    const defaultData = {
      name: `Categoria ${Date.now()}`,
      slug: `categoria-${Date.now()}`,
      use_in_menu: false
    };
    
    return await CategoriasModel.create({ ...defaultData, ...data });
  }
  
  static async createProduct(data = {}) {
    const defaultData = {
      enabled: true,
      name: `Produto ${Date.now()}`,
      slug: `produto-${Date.now()}`,
      stock: 10,
      description: "Descrição do produto de teste",
      price: 99.99,
      price_with_discount: 89.99
    };
    
    return await ProdutosModel.create({ ...defaultData, ...data });
  }
  
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      surname: user.surname
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || "test-secret",
      {
        expiresIn: '24h',
        issuer: 'projeto_backend',
        audience: "users"
      }
    );
  }
  
  static getAuthHeader(user) {
    const token = this.generateToken(user);
    return `Bearer ${token}`;
  }
}

module.exports = TestFactories;