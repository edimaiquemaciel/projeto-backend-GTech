const request = require("supertest");
const express = require("express");
const ProdutosRotas = require("../src/routes/ProdutosRotas");
const ProdutosModel = require("../src/models/ProdutosModel");
const { Op } = require("sequelize");

jest.mock("../src/models/ProdutosModel");
jest.mock("../src/models/CategoriasModel");
jest.mock("../src/models/OpcoesProduto");
jest.mock("../src/models/ImagensProduto");

const app = express();
app.use(express.json());
app.use(ProdutosRotas);

describe("GET /v1/product/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar produtos com paginação padrão e limite padrão 12", async () => {
    const fakeProducts = [];
    for (let i = 0; i < 5; i++) {
      fakeProducts.push({
        get: () => ({
          id: i + 1,
          name: `Produto ${i + 1}`,
          categorias: [{ id: 1 }],
          imagens: [{ id: 10, path: "img.jpg" }],
          opcoes: [{ id: 100, title: "Cor", values: "Azul,Verde" }],
        }),
      });
    }

    ProdutosModel.findAndCountAll.mockResolvedValue({
      count: 5,
      rows: fakeProducts,
    });

    const response = await request(app).get("/v1/product/search");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.limit).toBe(12);
    expect(response.body.page).toBe(1);

    expect(ProdutosModel.findAndCountAll).toHaveBeenCalled();

    const firstProduct = response.body.data[0];
    expect(firstProduct).toHaveProperty("category_ids");
    expect(firstProduct).toHaveProperty("images");
    expect(firstProduct).toHaveProperty("options");
  });

  test("deve retornar erro 400 para limit inválido", async () => {
    const response = await request(app).get("/v1/product/search?limit=-2");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("erro");
    expect(response.body.erro).toMatch(/limit/);
  });

  test("deve retornar todos os produtos quando limit=-1 ignorando paginação", async () => {
    const fakeProducts = [
      {
        get: () => ({
          id: 1,
          name: "Produto 1",
          categorias: [{ id: 1 }],
          imagens: [{ id: 10, path: "img.jpg" }],
          opcoes: [{ id: 100, title: "Cor", values: "Azul,Verde" }],
        }),
      },
      {
        get: () => ({
          id: 2,
          name: "Produto 2",
          categorias: [{ id: 2 }],
          imagens: [{ id: 11, path: "img2.jpg" }],
          opcoes: [{ id: 101, title: "Tamanho", values: "P,M,G" }],
        }),
      },
    ];

    ProdutosModel.findAll.mockResolvedValue(fakeProducts);

    const response = await request(app).get("/v1/product/search?limit=-1");

    expect(response.status).toBe(200);
    expect(response.body.limit).toBe(-1);
    expect(response.body.page).toBe(1);
    expect(response.body.data).toHaveLength(2);
    expect(ProdutosModel.findAll).toHaveBeenCalled();
  });

  test("deve filtrar por match no nome ou descrição", async () => {
    ProdutosModel.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        {
          get: () => ({
            id: 1,
            name: "Tênis Esportivo",
            categorias: [],
            imagens: [],
            opcoes: [],
          }),
        },
      ],
    });

    const response = await request(app).get("/v1/product/search?match=Tênis");

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toMatch(/Tênis/);

    const calledArgs = ProdutosModel.findAndCountAll.mock.calls[0][0];

    expect(calledArgs).toHaveProperty("where");

    expect(Object.getOwnPropertySymbols(calledArgs.where)).toContain(Op.or);
  });

  test("deve retornar erro 400 para price-range inválido", async () => {
    const response = await request(app).get("/v1/product/search?price-range=200-100");

    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/price-range/);
  });

  test("deve aceitar filtros category_ids, price-range e option[ID]", async () => {
    ProdutosModel.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        {
          get: () => ({
            id: 1,
            name: "Produto Teste",
            categorias: [{ id: 15 }, { id: 24 }],
            imagens: [],
            opcoes: [{ id: 45, title: "Tamanho", values: "GG,PP" }],
          }),
        },
      ],
    });

    const response = await request(app).get(
      "/v1/product/search?category_ids=15,24&price-range=100-200&option[45]=GG,PP"
    );

    expect(response.status).toBe(200);
    expect(response.body.data[0].category_ids).toEqual(expect.arrayContaining([15, 24]));
    expect(response.body.data[0].options[0].values).toEqual(expect.arrayContaining(["GG", "PP"]));
  });
});
