const UsuariosController = require("../src/controllers/UsuariosController");
const UsuariosModel = require("../src/models/UsuariosModel");

jest.mock("../src/models/UsuariosModel");

describe("UsuariosController", () => {
  let controller;
  let req;
  let res;

  beforeEach(() => {
    controller = new UsuariosController();

    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  test("consultarPorId deve retornar 404 se usuário não for encontrado", async () => {
    req.params.id = 1;
    UsuariosModel.findByPk.mockResolvedValue(null);

    await controller.consultarPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não encontrado" });
  });

  test("consultarPorId deve retornar os dados se usuário existir", async () => {
    req.params.id = 1;
    const fakeUser = { id: 1, firstname: "João", surname: "Silva", email: "joao@email.com" };

    UsuariosModel.findByPk.mockResolvedValue(fakeUser);

    await controller.consultarPorId(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test("criar deve retornar 201 se usuário for criado", async () => {
    req.body = {
      firstname: "Maria",
      surname: "Souza",
      email: "maria@email.com",
      password: "senha123"
    };

    UsuariosModel.create.mockResolvedValue({});

    await controller.criar(req, res);

    expect(UsuariosModel.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário criado com sucesso" });
  });

  test("criar deve retornar 400 se houver erro", async () => {
    const erro = new Error("Erro ao criar usuário");
    UsuariosModel.create.mockRejectedValue(erro);

    await controller.criar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: erro.message });
  });

  test("atualizar deve retornar 204 se atualizar com sucesso", async () => {
    req.params.id = 1;
    req.body = { firstname: "Atualizado", email: "novo@email.com" };

    UsuariosModel.update.mockResolvedValue([1]);

    await controller.atualizar(req, res);

    expect(UsuariosModel.update).toHaveBeenCalledWith(
      { firstname: "Atualizado", email: "novo@email.com" },
      { where: { id: 1 } }
    );

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário atualizado com sucesso" });
  });

  test("deletar deve retornar 204 se deletar com sucesso", async () => {
    req.params.id = 1;
    UsuariosModel.destroy.mockResolvedValue(1);

    await controller.deletar(req, res);

    expect(UsuariosModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário removido com sucesso" });
  });
});
