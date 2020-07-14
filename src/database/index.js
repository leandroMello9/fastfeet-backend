import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import Deliveryman from '../app/models/Deliveryman';
import File from '../app/models/File';
import databaseconfig from '../config/database';
import Order from '../app/models/Order';
import DeliverymanProblem from '../app/models/DeliverymanProblem';

const models = [User, Recipient, File, Deliveryman, Order, DeliverymanProblem];
class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connect = new Sequelize(databaseconfig);
    models
      .map(model => model.init(this.connect))
      .map(model => model.associate && model.associate(this.connect.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gympoint',
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      }
    );
  }
}
export default new Database();
