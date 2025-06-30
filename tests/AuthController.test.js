const AuthController = require("../src/controllers/AuthController");
const UsuariosModel = require("../src/models/UsuariosModel");
const jwt = require("jsonwebtoken");

jest.mock("../src/models/UsuariosModel");
jest.mock("jsonwebtoken");

describe("AuthController", () => {
  let req;
  let res;
  let controller;

  beforeEach(() => {
    controller = new AuthController();

    req = { body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  test("deve retornar 400 se email ou senha estiverem ausentes", async () => {
    req.body = { email: "", password: "" };

    await controller.gerarToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: "Email e senha são obrigatórios" });
  });

  test("deve retornar 401 se usuário não existir", async () => {
    req.body = { email: "teste@email.com", password: "senha123" };
    UsuariosModel.findOne.mockResolvedValue(null);

    await controller.gerarToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: "Credenciais inválidas" });
  });

  test("deve retornar 401 se a senha for inválida", async () => {
    req.body = { email: "teste@email.com", password: "senha123" };

    UsuariosModel.findOne.mockResolvedValue({
      checkPassword: jest.fn().mockResolvedValue(false)
    });

    await controller.gerarToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: "Credenciais inválidas" });
  });

  test("deve retornar 200 e o token se login for bem-sucedido", async () => {
    req.body = { email: "teste@email.com", password: "senha123" };

    const fakeUser = {
      id: 1,
      email: req.body.email,
      firstname: "John",
      surname: "Doe",
      checkPassword: jest.fn().mockResolvedValue(true)
    };

    UsuariosModel.findOne.mockResolvedValue(fakeUser);
    jwt.sign.mockReturnValue("fake-jwt-token");

    process.env.JWT_SECRET = "test_secret";

    await controller.gerarToken(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        id: fakeUser.id,
        email: fakeUser.email
      }),
      process.env.JWT_SECRET,
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "fake-jwt-token" });
  });
});
