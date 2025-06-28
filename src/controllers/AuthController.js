const jwt = require("jsonwebtoken");
const UsuariosModel = require("../models/UsuariosModel");
require("dotenv").config()

class AuthController {
    async gerarToken(req, res) {
        try {
            const {email, password} = req.body;

            if(!email || !password) {
                return res.status(400).json({
                    erro: "Email e senha são obrigatórios"
                });
            }

            const usuario = await UsuariosModel.findOne({
                where: {email}
            });

            if(!usuario) {
                return res.status(401).json({
                    erro: "Credenciais inválidas"
                });
            }

            const senhaValida = await usuario.checkPassword(password);
            if(!senhaValida) {
                return res.status(401).json({
                    erro: "Credenciais inválidas"
                })
            }

            const payload = {
                id: usuario.id,
                email: usuario.email,
                firstname: usuario.firstname,
                surname: usuario.surname
            };

            const secretKey = process.env.JWT_SECRET;

            const token = jwt.sign(
                payload,
                secretKey,
                {
                    expiresIn:'24h',
                    issuer: 'projeto_backend',
                    audience: "users"
                });

                return res.status(200).json({
                    token
                })

        } catch (error) {
            return res.status(500).json({
                erro: "Erro interno do servidor",
                detalhe: error.message
            })
        }
    }
}


module.exports = AuthController;