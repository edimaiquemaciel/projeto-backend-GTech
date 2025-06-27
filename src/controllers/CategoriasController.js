const CategoriasModel = require("../models/CategoriasModel");

class CategoriasController {
    async search(req, res) {
        const { limit, page, fields, use_in_menu } = req.query;

        let limitInt = parseInt(limit, 10);
        if (isNaN(limitInt) || limitInt < -1) {
            return res.status(400).json({
                erro: 'O parâmetro "limit" deve ser um número inteiro maior ou igual a -1.'
            });
        }

        const limiteFinal = limitInt === -1 ? undefined : limitInt || 12;

        let whereCondition = {};
        if (use_in_menu === 'true') {
            whereCondition.use_in_menu = true;
        } else if (use_in_menu === 'false') {
            whereCondition.use_in_menu = false;
        }

        if (limiteFinal === undefined) {
            try {
                const categorias = await CategoriasModel.findAll({
                    attributes: {
                    include: parseFields(fields),
                    exclude: ['createdAt', 'updatedAt']
                },
                    where: whereCondition
                });

                return res.status(200).json({
                    data: categorias,
                    total: categorias.length,
                    limit: -1,
                    page: 1
                });
            } catch (error) {
                return res.status(500).json({
                    erro: 'Erro ao buscar categorias',
                    detalhe: error.message
                });
            }
        }

        let pageNum = parseInt(page, 10);
        if (isNaN(pageNum) || pageNum < 1) {
            pageNum = 1;
        }

        const offset = (pageNum - 1) * limiteFinal;

        try {
            const { count, rows } = await CategoriasModel.findAndCountAll({
                attributes: {
                    include: parseFields(fields),
                    exclude: ['createdAt', 'updatedAt']
                },
                where: whereCondition,
                limit: limiteFinal,
                offset: offset
            });

            return res.status(200).json({
                data: rows,
                total: count,
                limit: limiteFinal,
                page: pageNum
            });
        } catch (error) {
            return res.status(500).json({
                erro: 'Erro ao buscar categorias',
                detalhe: error.message
            });
        }
    }

    async consultaPorId(req, res) {
        try {
            const id = req.params.id;
            const dados = await CategoriasModel.findByPk(id, {
                attributes: ["id", "name", "slug", "use_in_menu"]
            })

            if (!dados) {
            return res.status(404).json({
                message: "Categoria não encontrada"
            });
        }
            return res.json(dados);
        } catch (error) {
            return res.status(500).json({
                message: "Erro interno no servidor",
                error: error.message
            });
        }

    }

    async criar(req, res) {
        try {
            const body = req.body;
            await CategoriasModel.create(body);
            return res.status(201).json({
                message: "Categoria criada com sucesso"
            })
        } catch (error) {
            return res.status(400).json({
                erro: error.message
            })
        }
    }

    async atualizar(req, res) {
        try {
            const id = req.params.id;
            const body = req.body;

            const camposPermitidos = ["name", "slug", "use_in_menu"];
            const dadosAtualizados = {};
            Object.keys(body).forEach(key => {
                if (camposPermitidos.includes(key)) {
                    dadosAtualizados[key] = body[key];
                }
            });
            await CategoriasModel.update(dadosAtualizados, {where: {id}});
            return res.status(204).json({
                message: "Categoria atualizada com sucesso"
            })

        } catch (error) {
            return res.status(400).json({
                erro: error.message
            })
        }
    }

    async deletar(req, res) {
        try {
            const id = req.params.id;
            await CategoriasModel.destroy({where: {id}});
            return res.status(204).json({
                message: "Categoria removida com sucesso"
            });
        } catch (error) {
            return res.status(400).json({
                erro: error.message
            })
        }
    }
}


function parseFields(fields) {
    if (!fields) return undefined;

    const fieldList = fields.split(',').map(f => f.trim());

    const allowedFields = ['id', 'name', 'slug', 'use_in_menu'];

    const filteredFields = fieldList.filter(f => allowedFields.includes(f));

    if (filteredFields.length === 0) return undefined;

    return filteredFields;
}

module.exports = CategoriasController;