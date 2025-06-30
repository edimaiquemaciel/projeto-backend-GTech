const request = require("supertest");
const express = require("express");
const UsuariosRotas = require("../src/routes/UsuariosRotas");
const validarToken = require("../src/middleware/validarToken");

const app = express();
app.use(express.json());
app.use(validarToken);
app.use(UsuariosRotas);

jest.mock("../src/models/UsuariosModel", () => ({
  findByPk: jest.fn().mockImplementation((id) => {
    if (id === "1" || id === 1) {
      return Promise.resolve({
        id: 1,
        firstname: "João",
        surname: "Silva",
        email: "joao@email.com"
      });
    }
    return Promise.resolve(null);
  }),
  create: jest.fn().mockResolvedValue({}),
  findOne: jest.fn().mockResolvedValue({
    id: 1,
    email: "joao@email.com",
    firstname: "João",
    surname: "Silva",
    checkPassword: jest.fn().mockResolvedValue(true)
  })
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fake-jwt-token"),
  verify: jest.fn((token) => {
    if (!token || token === "INVALID") {
      const error = new Error("Token inválido");
      error.name = "JsonWebTokenError";
      throw error;
    }
    if (token === "fake-jwt-token") {
      return {
        id: 1,
        email: "joao@email.com"
      };
    }
    const error = new Error("Token inválido");
    error.name = "JsonWebTokenError";
    throw error;
  })
}));

describe("Rotas de usuário", () => {
  test("POST /v1/user/token deve retornar token", async () => {
    const response = await request(app).post("/v1/user/token").send({
      email: "joao@email.com",
      password: "123456"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("GET /v1/user/1 deve retornar os dados do usuário", async () => {
    const response = await request(app)
      .get("/v1/user/1")
      .set("Authorization", "Bearer fake-jwt-token");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("firstname", "João");
  });

  test("GET /v1/user/999 deve retornar 404", async () => {
    const response = await request(app)
      .get("/v1/user/999")
      .set("Authorization", "Bearer fake-jwt-token");

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Usuário não encontrado");
  });

  test("GET /v1/user/1 sem token deve retornar 200", async () => {
    const response = await request(app).get("/v1/user/1");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("firstname", "João");
  });

  test("POST /v1/user (criar usuário) sem token deve retornar 201", async () => {
    const response = await request(app).post("/v1/user").send({
      firstname: "Maria",
      surname: "Souza",
      email: "maria@email.com",
      password: "senha123"
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message", "Usuário criado com sucesso");
  });
});
