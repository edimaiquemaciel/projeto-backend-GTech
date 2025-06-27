const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");
const bcrypt = require("bcrypt");

class UsuariosModel extends Model {
    checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

UsuariosModel.init(
    {
        firstname: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "O primeiro nome é obrigatório"
                }
            }
        },
        surname: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "O sobrenome é obrigatório"
                }
            }
        },
        email: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Email inválido"
                },
                notEmpty: {
                    msg: "O email é obrigatório"
                }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: "A senha é obrigatória"
            }
        }
    },
    {
        tableName: "usuarios",
        sequelize: connection,
        underscored: true,
        hooks: {
            beforeSave: async (user) => {
                if(user.changed("password")) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt)
                }
            }
        }
    }


)

module.exports = UsuariosModel;