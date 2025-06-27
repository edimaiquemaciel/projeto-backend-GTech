const express = require("express");
const models = require("./models");
const UsuariosRotas = require("./routes/UsuariosRotas");
const CategoriasRotas = require("./routes/CategoriasRotas");
const ProdutosRotas = require("./routes/ProdutosRotas");

const host = "localhost";
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(UsuariosRotas);
app.use(CategoriasRotas);
app.use(ProdutosRotas);

app.get("/", (req, res)=> {
    return res.send("Teste api")
});

app.listen(PORT, host, ()=> {
    console.log(`Server is running in http://${host}:${PORT}`);
})