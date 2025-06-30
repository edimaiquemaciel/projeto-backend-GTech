const request = require("supertest");
const createTestApp = require("../helpers/app");
const TestFactories = require("../helpers/factories");

const app = createTestApp();

describe("UsuariosController", () => {
  let user, authHeader;

  beforeEach(async () => {
    user = await TestFactories.createUser();
    authHeader = TestFactories.getAuthHeader(user);
  });

  describe("GET /v1/user/:id", () => {
    it("deve retornar usuário por ID", async () => {
      const response = await request(app)
        .get(`/v1/user/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", user.id);
      expect(response.body).toHaveProperty("firstname", user.firstname);
      expect(response.body).toHaveProperty("surname", user.surname);
      expect(response.body).toHaveProperty("email", user.email);
      expect(response.body).not.toHaveProperty("password");
    });

    it("deve retornar erro 404 quando usuário não existir", async () => {
      const response = await request(app)
        .get("/v1/user/99999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Usuário não encontrado");
    });
  });

  describe("POST /v1/user", () => {
    it("deve criar um novo usuário", async () => {
      const userData = {
        firstname: "Maria",
        surname: "Santos",
        email: "maria@example.com",
        password: "senha123456"
      };

      const response = await request(app)
        .post("/v1/user")
        .set("Authorization", authHeader)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Usuário criado com sucesso");
    });

    it("deve retornar erro 400 quando dados obrigatórios estão faltando", async () => {
      const response = await request(app)
        .post("/v1/user")
        .set("Authorization", authHeader)
        .send({
          firstname: "Maria"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
    });

    it("deve retornar erro 400 quando email já existe", async () => {
      const userData = {
        firstname: "Maria",
        surname: "Santos",
        email: user.email,
        password: "senha123456"
      };

      const response = await request(app)
        .post("/v1/user")
        .set("Authorization", authHeader)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
    });

    it("deve retornar erro 400 quando não há token", async () => {
      const userData = {
        firstname: "Maria",
        surname: "Santos",
        email: "maria@example.com",
        password: "senha123456"
      };

      const response = await request(app)
        .post("/v1/user")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro", "Token de acesso requerido");
    });
  });

  describe("PUT /v1/user/:id", () => {
    it("deve atualizar um usuário", async () => {
      const updateData = {
        firstname: "João Atualizado",
        surname: "Silva Atualizado"
      };

      const response = await request(app)
        .put(`/v1/user/${user.id}`)
        .set("Authorization", authHeader)
        .send(updateData);

      expect(response.status).toBe(204);
    });

    it("deve retornar erro 400 quando não há token", async () => {
      const response = await request(app)
        .put(`/v1/user/${user.id}`)
        .send({ firstname: "Novo Nome" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro", "Token de acesso requerido");
    });
  });

  describe("DELETE /v1/user/:id", () => {
    it("deve deletar um usuário", async () => {
      const response = await request(app)
        .delete(`/v1/user/${user.id}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(204);
    });

    it("deve retornar erro 400 quando não há token", async () => {
      const response = await request(app)
        .delete(`/v1/user/${user.id}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro", "Token de acesso requerido");
    });
  });
});