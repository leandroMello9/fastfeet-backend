import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
        },
        street: {
          type: Sequelize.STRING,
        },
        number: {
          type: Sequelize.INTEGER,
        },
        complement: {
          type: Sequelize.STRING,
        },
        state: {
          type: Sequelize.STRING,
        },
        city: {
          type: Sequelize.STRING,
        },
        cep: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}
export default Recipient;
