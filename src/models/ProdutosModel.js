const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");

class ProdutosModel extends Model {
    static associate(models) {
        this.hasMany(models.ImagensProduto, {
            foreignKey: "product_id",
            as: "imagens"
        })

        this.hasMany(models.OpcoesProduto, {
            foreignKey: "product_id",
            as: "opcoes"
        })

        this.belongsToMany(models.CategoriasModel,{
            through: models.ProdutosCategoriaModel,
            foreignKey: "product_id",
            as: "categorias"
        })
    }
}

ProdutosModel.init(
    {
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        use_in_menu: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        description: {
            type: DataTypes.STRING(255)
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        price_with_discount: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    },
    {
        tableName: "produtos",
        sequelize: connection,
        underscored: true
    }
)

module.exports = ProdutosModel;