import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
        },
        email: {
          type: Sequelize.STRING,
        },
        password: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
      }
    );
    // Antes de todo usuario se cadastro addHook sera executado de forma automatica
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  static associate(models) {
    // Pertence a quem??? avatar do usuario
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkedPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}
export default User;
