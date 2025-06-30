const jwt = require("jsonwebtoken");
require("dotenv").config();

function validarToken(req, res, next) {

    const rotasLivres = [
        '/v1/user/token',
        '/v1/user'
    ];

    if (rotasLivres.includes(req.path) && req.method === 'POST') {
        return next();
    }

    const metodosProtegidos = ['POST', 'PUT', 'DELETE'];

    if (!metodosProtegidos.includes(req.method)) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).json({
            erro: "Token de acesso requerido"
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
            erro: "Token de acesso requerido"
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({
            erro: "Token de acesso requerido"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                erro: "Token expirado"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                erro: "Token inválido"
            });
        } else {
            return res.status(401).json({
                erro: "Falha na autenticação"
            });
        }
    }
}

module.exports = validarToken;
