import Sequelize, { Model } from 'sequelize';

class Deliveryman extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
        },
        avatar_id: {
          type: Sequelize.NUMBER,
        },
        email: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    // Pertence a quem??? avatar do usuario
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }
}
export default Deliveryman;
