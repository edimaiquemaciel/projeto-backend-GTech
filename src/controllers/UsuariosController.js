const UsuariosModel = require("../models/UsuariosModel");

class UsuariosController {
    async consultarPorId(req,res){
        try {
            const id = req.params.id;
            const dados = await UsuariosModel.findByPk(id, {
                attributes: ["id", "firstname", "surname", "email"]
            })

            if (!dados) {
            return res.status(404).json({
                message: "Usuário não encontrado"
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
            await UsuariosModel.create(body);
            return res.status(201).json({
                message: "Usuário criado com sucesso"
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

            const camposPermitidos = ["firstname", "surname", "email"];
            const dadosAtualizados = {};
            Object.keys(body).forEach(key => {
                if (camposPermitidos.includes(key)) {
                    dadosAtualizados[key] = body[key];
                }
            });
            await UsuariosModel.update(dadosAtualizados, {where: {id}});
            return res.status(204).json({
                message: "Usuário atualizado com sucesso"
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
            await UsuariosModel.destroy({where: {id}});
            return res.status(204).json({
                message: "Usuário removido com sucesso"
            });
        } catch (error) {
            return res.status(400).json({
                erro: error.message
            })
        }
    }
}

module.exports = UsuariosController;