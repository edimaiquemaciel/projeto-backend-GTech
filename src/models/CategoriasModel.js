const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");


class CategoriasModel extends Model {
    static associate(models) {
        this.belongsToMany(models.ProdutosModel, {
            through: models.ProdutosCategoriaModel,
            foreignKey: "category_id",
            as: "produtos"
        })
    }
}

CategoriasModel.init(
    {
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "O nome é obrigatório"
                }
            }
        },
        slug: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "O slug é obrigatório"
                }
            }
        },
        use_in_menu: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        }
    },
    {
        tableName: "categorias",
        sequelize: connection,
        underscored: true
    }
)

module.exports = CategoriasModel;