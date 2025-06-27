const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");

class ImagensProduto extends Model {
    static associate(models) {
        ImagensProduto.belongsTo(models.ProdutosModel, {
            foreignKey: "product_id",
            as: "produto"
        })
    }
}

ImagensProduto.init(
    {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        path: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: "imagens_produto",
        sequelize: connection,
        underscored: true
    }
)

module.exports = ImagensProduto;