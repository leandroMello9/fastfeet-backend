import * as Yup from 'yup';
import { Op } from 'sequelize';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class ReadyOrderController {
  async update(req, res) {
    /**
     * Check user is a deliveryman
     */
    const deliveryman = await Deliveryman.findByPk(req.params.deliveryman_id);

    if (!deliveryman) {
      return res.status(401).json({ error: 'User is not a deliveryman' });
    }

    /**
     * Check if order exists
     */
    const order = await Order.findOne({
      where: {
        id: req.params.order_id,
        end_date: null,
        canceled_at: null,
        start_date: { [Op.not]: null },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ error: 'Not found order, or order already get out delivery' });
    }

    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValidSync(req.body))) {
      return res.status(404).json({ error: 'Error to update order' });
    }

    order.end_date = new Date().toJSON();
    await order.save();

    return res.json(order);
  }
}

export default new ReadyOrderController();
