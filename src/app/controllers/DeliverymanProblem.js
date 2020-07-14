import DeliveryProblems from '../models/DeliverymanProblem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Recipient from '../models/Recipient';

class DeliverymanProblem {
  async index(req, res) {
    const problem = await DeliveryProblems.findAll();
    if (!problem) {
      return res.status(400).json({ message: 'Problem is not exist' });
    }
    return res.json(problem);
  }

  async store(req, res) {
    const { deliveryman_id: delivery_id } = req.body;

    const order = await Order.findAll({
      where: delivery_id,
    });

    if (!order) {
      return res.status(400).json({ error: "Order don't exists" });
    }

    const checkDeliveryman = await Deliveryman.findByPk(delivery_id);

    if (!checkDeliveryman) {
      return res
        .status(401)
        .json({ error: 'Only deliverymans can post problems' });
    }

    const newDeliveramProblem = {
      delivery_id,
      description: req.body.description,
    };
    const problem = await DeliveryProblems.create(newDeliveramProblem);
    return res.json(problem);
  }

  async show(req, res) {
    const { id: deliveryman_id } = req.params;
    const problem = await DeliveryProblems.findAll({
      where: { delivery_id: deliveryman_id },
    });
    const order = await Order.findOne({
      where: { deliveryman_id },
    });

    if (!order) {
      return res.status(400).json({ error: "Order don't exists" });
    }
    const orderProblem = [...problem];

    const orderProblemArray = [];

    return res.json(orderProblem);
  }

  async delete(req, res) {
    const problem = await DeliveryProblems.findByPk(req.params.id);

    if (!problem) {
      return res.status(400).json({ error: "Problem don't exists" });
    }

    const order = await Order.findOne({
      where: { id: problem.delivery_id },
    });

    if (!order) {
      return res.status(400).json({ error: "Order don't exists" });
    }

    const checkCancel = await Order.findOne({
      where: { id: problem.delivery_id, canceled_at: null },
    });

    if (!checkCancel) {
      return res
        .status(400)
        .json({ error: "Order don't exist or are cancel already" });
    }

    checkCancel.canceled_at = new Date().toJSON();
    await checkCancel.save();

    const { name, email } = await Deliveryman.findByPk(order.deliveryman_id);
    const productName = order.product;

    await Queue.add(CancellationMail.key, {
      name,
      productName,
      email,
    });

    return res.send();
  }
}

export default new DeliverymanProblem();
