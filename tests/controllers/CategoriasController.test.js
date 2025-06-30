const request = require("supertest");
const createTestApp = require("../helpers/app");
const TestFactories = require("../helpers/factories");

const app = createTestApp();

describe("CategoriasController", () => {
  let user, authHeader;

  beforeEach(async () => {
    user = await TestFactories.createUser();
    authHeader = TestFactories.getAuthHeader(user);
  });

  describe("GET /v1/category/search", () => {
    beforeEach(async () => {
      await TestFactories.createCategory({ name: "Categoria 1", use_in_menu: true });
      await TestFactories.createCategory({ name: "Categoria 2", use_in_menu: false });
      await TestFactories.createCategory({ name: "Categoria 3", use_in_menu: true });
    });

    it("deve retornar todas as categorias com paginação padrão", async () => {
      const response = await request(app)
        .get("/v1/category/search");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total", 3);
      expect(response.body).toHaveProperty("limit", 12);
      expect(response.body).toHaveProperty("page", 1);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("deve filtrar categorias por use_in_menu=true", async () => {
      const response = await request(app)
        .get("/v1/category/search?use_in_menu=true");

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(2);
      expect(response.body.data.every(cat => cat.use_in_menu === true)).toBe(true);
    });

    it("deve filtrar categorias por use_in_menu=false", async () => {
      const response = await request(app)
        .get("/v1/category/search?use_in_menu=false");

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      expect(response.body.data.every(cat => cat.use_in_menu === false)).toBe(true);
    });

    it("deve retornar todas as categorias quando limit=-1", async () => {
      const response = await request(app)
        .get("/v1/category/search?limit=-1");

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(-1);
      expect(response.body.page).toBe(1);
      expect(response.body.total).toBe(3);
    });

    it("deve aplicar limit personalizado", async () => {
      const response = await request(app)
        .get("/v1/category/search?limit=2");

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it("deve retornar erro 400 com limit inválido", async () => {
      const response = await request(app)
        .get("/v1/category/search?limit=abc");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
    });
  });

  describe("GET /v1/category/:id", () => {
    let categoria;

    beforeEach(async () => {
      categoria = await TestFactories.createCategory();
    });

    it("deve retornar categoria por ID", async () => {
      const response = await request(app)
        .get(`/v1/category/${categoria.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", categoria.id);
      expect(response.body).toHaveProperty("name", categoria.name);
      expect(response.body).toHaveProperty("slug", categoria.slug);
      expect(response.body).toHaveProperty("use_in_menu");
    });

    it("deve retornar erro 404 quando categoria não existir", async () => {
      const response = await request(app)
        .get("/v1/category/99999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Categoria não encontrada");
    });
  });

  describe("POST /v1/category", () => {
    it("deve criar uma nova categoria", async () => {
      const categoryData = {
        name: "Nova Categoria",
        slug: "nova-categoria",
        use_in_menu: true
      };

      const response = await request(app)
        .post("/v1/category")
        .set("Authorization", authHeader)
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Categoria criada com sucesso");
    });

    it("deve retornar erro 400 quando dados obrigatórios estão faltando", async () => {
      const response = await request(app)
        .post("/v1/category")
        .set("Authorization", authHeader)
        .send({
          name: "Categoria sem slug"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
    });

    it("deve retornar erro 400 quando não há token", async () => {
      const categoryData = {
        name: "Nova Categoria",
        slug: "nova-categoria"
      };

      const response = await request(app)
        .post("/v1/category")
        .send(categoryData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro", "Token de acesso requerido");
    });
  });

  describe("PUT /v1/category/:id", () => {
    let categoria;

    beforeEach(async () => {
      categoria = await TestFactories.createCategory();
    });

    it("deve atualizar uma categoria", async () => {
      const updateData = {
        name: "Categoria Atualizada",
        use_in_menu: true
      };

      const response = await request(app)
        .put(`/v1/category/${categoria.id}`)
        .set("Authorization", authHeader)
        .send(updateData);

      expect(response.status).toBe(204);
    });

    it("deve retornar erro 400 quando não há token", async () => {
      const response = await request(app)
        .put(`/v1/category/${categoria.id}`)
        .send({ name: "Novo Nome" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro", "Token de acesso requerido");
    });
  });

  describe("DELETE /v1/category/:id", () => {
    let categoria;

    beforeEach(async () => {
      categoria = await TestFactories.createCategory();
    });

    it("deve deletar uma categoria", async () => {
      const response = await request(app)
        .delete(`/v1/category/${categoria.id}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(204);
    });

    it("deve retornar erro 400 quando não há token", async () => {
      const response = await request(app)
        .delete(`/v1/category/${categoria.id}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro", "Token de acesso requerido");
    });
  });
});