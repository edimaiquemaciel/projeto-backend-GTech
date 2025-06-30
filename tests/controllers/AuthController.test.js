const request = require("supertest");
const createTestApp = require("../helpers/app");
const TestFactories = require("../helpers/factories");

const app = createTestApp();

describe("AuthController", () => {
  describe("POST /v1/user/token", () => {
    it("deve gerar token com credenciais válidas", async () => {
      const user = await TestFactories.createUser({
        email: "teste@example.com",
        password: "senha123456"
      });

      const response = await request(app)
        .post("/v1/user/token")
        .send({
          email: "teste@example.com",
          password: "senha123456"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });

    it("deve retornar erro 400 quando email não for fornecido", async () => {
      const response = await request(app)
        .post("/v1/user/token")
        .send({
          password: "senha123456"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
      expect(response.body.erro).toBe("Email e senha são obrigatórios");
    });

    it("deve retornar erro 400 quando senha não for fornecida", async () => {
      const response = await request(app)
        .post("/v1/user/token")
        .send({
          email: "teste@example.com"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("erro");
      expect(response.body.erro).toBe("Email e senha são obrigatórios");
    });

    it("deve retornar erro 401 com email inexistente", async () => {
      const response = await request(app)
        .post("/v1/user/token")
        .send({
          email: "inexistente@example.com",
          password: "senha123456"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("erro");
      expect(response.body.erro).toBe("Credenciais inválidas");
    });

    it("deve retornar erro 401 com senha incorreta", async () => {
      await TestFactories.createUser({
        email: "teste@example.com",
        password: "senha123456"
      });

      const response = await request(app)
        .post("/v1/user/token")
        .send({
          email: "teste@example.com",
          password: "senhaerrada"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("erro");
      expect(response.body.erro).toBe("Credenciais inválidas");
    });
  });
});