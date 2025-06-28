const { Op } = require('sequelize');
const ProdutosModel = require('../models/ProdutosModel');
const CategoriasModel = require('../models/CategoriasModel');
const OpcoesProduto = require('../models/OpcoesProduto');
const ImagensProduto = require('../models/ImagensProduto');

class ProdutosController {

  async search(req, res) {
  const { limit, page, fields, match, category_ids, 'price-range': priceRange, ...queryRest } = req.query;

  let limitInt = parseInt(limit, 10);
  if (isNaN(limitInt) || limitInt < -1) {
    return res.status(400).json({ erro: 'O parâmetro "limit" deve ser um número inteiro maior ou igual a -1.' });
  }

  const limiteFinal = limitInt === -1 ? undefined : limitInt || 12;

  let pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  const offset = (pageNum - 1) * limiteFinal;

  const whereConditions = {};

  if (match && typeof match === 'string') {
    whereConditions[Op.or] = [
      { name: { [Op.iLike]: `%${match}%` } },
      { description: { [Op.iLike]: `%${match}%` } }
    ];
  }

  if (priceRange && typeof priceRange === 'string') {
    const [minStr, maxStr] = priceRange.split('-').map(str => str.trim());
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > max) {
      return res.status(400).json({ erro: 'O parâmetro "price-range" deve ter o formato "min-max", onde ambos são números positivos e min <= max.' });
    }

    whereConditions.price = { [Op.between]: [min, max] };
  }

  // Sempre incluir as associações básicas (imagens e opções)
  const includeOptions = [
    {
      model: ImagensProduto,
      as: 'imagens',
      attributes: ['id', 'path']
    },
    {
      model: OpcoesProduto,
      as: 'opcoes',
      attributes: ['id', 'title', 'values']
    }
  ];

  // Adicionar filtro por categorias se especificado
  if (category_ids) {
    const idsArray = category_ids.split(',').map(id => parseInt(id.trim(), 10));
    if (idsArray.some(isNaN)) {
      return res.status(400).json({ erro: 'Todos os valores em "category_ids" devem ser números inteiros válidos.' });
    }

    includeOptions.push({
      model: CategoriasModel,
      as: 'categorias',
      where: { id: { [Op.in]: idsArray } },
      attributes: ['id'],
      through: { attributes: [] }
    });
  } else {
    // Sempre incluir categorias, mesmo quando não há filtro
    includeOptions.push({
      model: CategoriasModel,
      as: 'categorias',
      attributes: ['id'],
      through: { attributes: [] }
    });
  }

  // Processar filtros de opções
  for (const key in queryRest) {
    if (key.startsWith('option[')) {
      const matchOption = key.match(/option\[([0-9]+)\]/);
      if (matchOption) {
        const optionId = parseInt(matchOption[1], 10);
        const values = queryRest[key].split(',').map(v => v.trim());

        // Substituir a associação de opções existente por uma com filtro
        const opcaoIndex = includeOptions.findIndex(inc => inc.as === 'opcoes');
        if (opcaoIndex !== -1) {
          includeOptions[opcaoIndex] = {
            model: OpcoesProduto,
            as: 'opcoes',
            where: {
              id: optionId,
              values: {
                [Op.or]: values.map(value => ({ [Op.iLike]: `%${value}%` })),
              },
            },
            attributes: ['id', 'title', 'values']
          };
        }
      }
    }
  }

  try {
    if (limiteFinal === undefined) {
      const produtos = await ProdutosModel.findAll({
        attributes: {
          include: parseFields(fields),
          exclude: ['createdAt', 'updatedAt']
        },
        where: whereConditions,
        include: includeOptions
      });

      const formatted = formatProducts(produtos);
      return res.json({ data: formatted, total: produtos.length, limit: -1, page: 1 });
    }

    const { count, rows } = await ProdutosModel.findAndCountAll({
      attributes: {
        include: parseFields(fields),
        exclude: ['createdAt', 'updatedAt']
      },
      where: whereConditions,
      include: includeOptions,
      limit: limiteFinal,
      offset,
      distinct: true // Importante para contar corretamente com joins
    });

    const formatted = formatProducts(rows);

    return res.json({
      data: formatted,
      total: count,
      limit: limiteFinal,
      page: pageNum
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar produtos', detalhe: error.message });
  }
}

  async consultarPorId(req, res) {
    const { id } = req.params;

    try {
      const produto = await ProdutosModel.findByPk(id, {
        include: [
          {
            model: CategoriasModel,
            as: 'categorias',
            attributes: ['id'],
            through: { attributes: [] }
          },
          {
            model: OpcoesProduto,
            as: 'opcoes',
            attributes: ['id', 'title', 'values']
          },
          {
            model: ImagensProduto,
            as: 'imagens',
            attributes: ['id', 'path']
          }
        ]
      });

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      const data = produto.get({ plain: true });

      data.category_ids = (data.categorias || []).map(c => c.id);
      delete data.categorias;

      data.options = (data.opcoes || []).map(opt => ({
        id: opt.id,
        title: opt.title,
        values: opt.values.split(',').map(v => v.trim())
      }));
      delete data.opcoes;

      data.images = (data.imagens || []).map(img => ({
        id: img.id,
        content: img.path
      }));
      delete data.imagens;

      return res.status(200).json(data);

    } catch (error) {
      return res.status(500).json({
        erro: 'Erro ao buscar produto',
        detalhe: error.message
      });
    }
  }

  async criar(req, res) {
  const transaction = await ProdutosModel.sequelize.transaction();

  try {
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids,
      images,
      options
    } = req.body;

    if (!name || !slug || price === undefined) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando: name, slug ou price' });
    }

    // Criar produto
    const produto = await ProdutosModel.create({
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount
    }, { transaction });

    // Garantir que o produto é uma instância do Sequelize
    if (!produto || !(produto instanceof ProdutosModel)) {
      throw new Error('Falha ao criar instância do produto');
    }

    // Associar categorias
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      await produto.setCategorias(category_ids, { transaction });
    }

    // Salvar imagens
    const imagensCriadas = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        const imagem = await ImagensProduto.create({
          product_id: produto.id,
          enabled: true,
          path: img.content
        }, { transaction });

        imagensCriadas.push({
          id: imagem.id,
          content: imagem.path
        });
      }
    }

    // Salvar opções
    const opcoesCriadas = [];
    if (Array.isArray(options) && options.length > 0) {
      for (const opt of options) {
        const values = Array.isArray(opt.values) ? opt.values : [opt.values];
        const opcao = await OpcoesProduto.create({
          product_id: produto.id,
          title: opt.title,
          shape: opt.shape,
          radius: opt.radius || 0,
          type: opt.type,
          values: values.join(',')
        }, { transaction });

        opcoesCriadas.push({
          id: opcao.id,
          title: opcao.title,
          values: opcao.values.split(',')
        });
      }
    }

    // Confirmar transação
    await transaction.commit();

    return res.status(201).json({
      id: produto.id,
      enabled: produto.enabled,
      name: produto.name,
      slug: produto.slug,
      stock: produto.stock,
      description: produto.description,
      price: produto.price,
      price_with_discount: produto.price_with_discount,
      category_ids: category_ids || [],
      images: imagensCriadas,
      options: opcoesCriadas
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error); // Log detalhado no servidor
    await transaction.rollback();
    return res.status(500).json({
      erro: 'Erro ao criar produto',
      detalhe: error.message
    });
  }
}

  async atualizar(req, res) {
    const { id } = req.params;
    const transaction = await ProdutosModel.sequelize.transaction();

    try {
      const {
        enabled,
        name,
        slug,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images = [],
        options = []
      } = req.body;

      if (!name || !slug || price === undefined) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando: name, slug ou price' });
      }


      const produto = await ProdutosModel.findByPk(id);
      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }


      await produto.update({
        enabled,
        name,
        slug,
        stock,
        description,
        price,
        price_with_discount
      }, { transaction });


      if (Array.isArray(category_ids)) {
        await produto.setCategorias(category_ids, { transaction });
      }


      const imageIdsToKeep = [];

      for (const img of images) {
        if (img.deleted && img.id) {

          await ImagensProduto.destroy({
            where: { id: img.id },
            transaction
          });
        } else if (img.id) {

          await ImagensProduto.update({
            path: img.content
          }, {
            where: { id: img.id },
            transaction
          });
          imageIdsToKeep.push(img.id);
        } else {

          const imagem = await ImagensProduto.create({
            product_id: produto.id,
            enabled: true,
            path: img.content
          }, { transaction });

          imageIdsToKeep.push(imagem.id);
        }
      }

      await ImagensProduto.destroy({
        where: {
          product_id: produto.id,
          id: {
            [Op.notIn]: imageIdsToKeep
          }
        },
        transaction
      });


      const optionIdsToKeep = [];

      for (const opt of options) {
        if (opt.deleted && opt.id) {

          await OpcoesProduto.destroy({
            where: { id: opt.id },
            transaction
          });
        } else if (opt.id) {

          const values = Array.isArray(opt.values) ? opt.values : [opt.values];
          await OpcoesProduto.update({
            radius: opt.radius,
            values: values.join(',')
          }, {
            where: { id: opt.id },
            transaction
          });
          optionIdsToKeep.push(opt.id);
        } else {

          const values = Array.isArray(opt.values) ? opt.values : [opt.values];
          const opcao = await OpcoesProduto.create({
            product_id: produto.id,
            title: opt.title,
            shape: opt.shape,
            radius: opt.radius || 0,
            type: opt.type,
            values: values.join(',')
          }, { transaction });

          optionIdsToKeep.push(opcao.id);
        }
      }

      await OpcoesProduto.destroy({
        where: {
          product_id: produto.id,
          id: {
            [Op.notIn]: optionIdsToKeep
          }
        },
        transaction
      });

      await transaction.commit();

      const produtoAtualizado = await ProdutosModel.findByPk(id, {
        include: [
          {
            model: ImagensProduto,
            as: 'imagens',
            attributes: ['id', 'path']
          },
          {
            model: OpcoesProduto,
            as: 'opcoes',
            attributes: ['id', 'title', 'values']
          }
        ]
      });

      const data = produtoAtualizado.get({ plain: true });

      data.images = data.imagens.map(i => ({
        id: i.id,
        content: i.path
      }));
      delete data.imagens;

      data.options = data.opcoes.map(o => ({
        id: o.id,
        title: o.title,
        values: o.values.split(',')
      }));
      delete data.opcoes;

      data.category_ids = await produto.getCategorias().then(cats => cats.map(c => c.id));

      return res.json(data);

    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        erro: 'Erro ao atualizar produto',
        detalhe: error.message
      });
    }
  }

  async deletar(req, res) {
    const { id } = req.params;

    try {
      const produto = await ProdutosModel.findByPk(id);

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      await produto.destroy();

      return res.status(204).send();

    } catch (error) {
      return res.status(500).json({
        erro: 'Erro ao deletar produto',
        detalhe: error.message
      });
    }
  }


}

function parseFields(fields) {
  if (!fields) return undefined;

  const allowedFields = [
    'id', 'enabled', 'name', 'slug', 'stock', 'description', 'price',
    'price_with_discount', 'category_ids', 'images', 'options'
  ];

  const fieldList = fields.split(',').map(f => f.trim());
  const filteredFields = fieldList.filter(f => allowedFields.includes(f));

  return filteredFields.length ? filteredFields : undefined;
}

function formatProducts(produtos) {
  return produtos.map(p => {
    const data = p.get({ plain: true });

    // Formatar category_ids
    if (data.categorias) {
      data.category_ids = data.categorias.map(c => c.id);
      delete data.categorias;
    } else {
      data.category_ids = [];
    }

    // Formatar images
    if (data.imagens) {
      data.images = data.imagens.map(img => ({
        id: img.id,
        content: img.path
      }));
      delete data.imagens;
    } else {
      data.images = [];
    }

    // Formatar options
    if (data.opcoes) {
      data.options = data.opcoes.map(opt => ({
        id: opt.id,
        title: opt.title,
        values: opt.values.split(',').map(v => v.trim())
      }));
      delete data.opcoes;
    } else {
      data.options = [];
    }

    return data;
  });
}

module.exports = ProdutosController;