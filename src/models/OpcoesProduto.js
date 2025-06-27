const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");

class OpcoesProduto extends Model {
    static associate(models) {
        OpcoesProduto.belongsTo(models.ProdutosModel, {
            foreignKey: "product_id",
            as: "produto"
        })
    }
}

OpcoesProduto.init(
    {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        shape: {
            type: DataTypes.ENUM("square", "circle"),
            defaultValue: "square"
        },
        radius: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        type: {
            type: DataTypes.ENUM("text", "color"),
            defaultValue: "text"
        },
        values: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: "opcoes_produto",
        sequelize: connection,
        underscored: true
    }
)

module.exports = OpcoesProduto;