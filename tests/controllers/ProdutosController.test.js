const request = require("supertest");
const createTestApp = require("../helpers/app");
const TestFactories = require("../helpers/factories");

const app = createTestApp();

describe("ProdutosController", () => {
  let user, authHeader, categoria;

  beforeEach(async () => {
    user = await TestFactories.createUser();
    authHeader = TestFactories.getAuthHeader(user);
    categoria = await TestFactories.createCategory();
  });

  describe("GET /v1/product/search", () => {
    beforeEach(async () => {
      const produto1 = await TestFactories.createProduct({ 
        name: "Produto 1", 
        price: 100.00 
      });
      const produto2 = await TestFactories.createProduct({ 
        name: "Produto 2", 
        price: 200.00 
      });
      
      // Associar produtos às categorias
      await produto1.setCategorias([categoria.id]);
      await produto2.setCategorias([categoria.id]);
    });

    it("deve retornar todos os produtos com paginação padrão", async () => {
      const response = await request(app)
        .get("/v1/product/search");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total", 2);
      expect(response.body).toHaveProperty("limit", 12);
      expect(response.body).toHaveProperty("page", 1);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("deve filtrar produtos por texto", async () => {
      const response = await request(app)
        .get("/v1/product/search?match=Produto 1");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("Produto 1");
    });

    it("deve filtrar produtos por categoria", async () => {
      const response = await request(app)
        .get(`/v1/product/search?category_ids=${categoria.id}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(2);
    });

    it("deve filtrar produtos por faixa de preço", async () => {
      const response = await request(app)
        .get("/v1/product/search?price-range=50-150");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].price).toBe(100);
    });

    it("deve retornar erro 400 com faixa de preço inválida", async () => {
      const response = await request(app)
        .get("/v1/product/search?price-range=abc-def");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
    });

    it("deve retornar todos os produtos quando limit=-1", async () => {
      const response = await request(app)
        .get("/v1/product/search?limit=-1");

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(-1);
      expect(response.body.page).toBe(1);
    });
  });

  describe("GET /v1/product/:id", () => {
    let produto;

    beforeEach(async () => {
      produto = await TestFactories.createProduct();
      await produto.setCategorias([categoria.id]);
    });

    it("deve retornar produto por ID", async () => {
      const response = await request(app)
        .get(`/v1/product/${produto.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", produto.id);
      expect(response.body).toHaveProperty("name", produto.name);
      expect(response.body).toHaveProperty("price", produto.price);
      expect(response.body).toHaveProperty("category_ids");
      expect(response.body).toHaveProperty("options");
      expect(response.body).toHaveProperty("images");
      expect(Array.isArray(response.body.category_ids)).toBe(true);
    });

    it("deve retornar erro 404 quando produto não existir", async () => {
      const response = await request(app)
        .get("/v1/product/99999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("erro", "Produto não encontrado");
    });
  });

  describe("POST /v1/product", () => {
    it("deve criar um novo produto", async () => {
      const productData = {
        enabled: true,
        name: "Novo Produto",
        slug: "novo-produto",
        stock: 10,
        description: "Descrição do produto",
        price: 99.99,
        price_with_discount: 89.99,
        category_ids: [categoria.id],
        images: [
          { content: "/images/produto1.jpg" }
        ],
        options: [
          {
            title: "Cor",
            shape: "square",
            type: "color",
            values: ["azul", "vermelho"]
          }
        ]
      };

      const response = await request(app)
        .post("/v1/product")
        .set("Authorization", authHeader)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name", "Novo Produto");
      expect(response.body).toHaveProperty("price", 99.99);
      expect(response.body).toHaveProperty("category_ids");
      expect(response.body).toHaveProperty("");