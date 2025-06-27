const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");
const ProdutosModel = require("./ProdutosModel");
const CategoriasModel = require("./CategoriasModel");

class ProdutosCategoriaModel extends Model {} 

ProdutosCategoriaModel.init(
    {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ProdutosModel,
                key: "id"
            },
            onDelete: "CASCADE"
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: CategoriasModel,
                key: "id"
            },
            onDelete: "CASCADE"
        }
    },
    {
        tableName: "produtos_categorias",
        timestamps: false,
        sequelize: connection,
        underscored: true,
        indexes: [
        {
          unique: true,
          fields: ['product_id', 'category_id'],
          name: 'unique_produto_categoria'
        }
      ]
    }
)

module.exports = ProdutosCategoriaModel;