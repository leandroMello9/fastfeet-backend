import { Op } from 'sequelize';
import { startOfDay, endOfDay, isBefore, isAfter, getHours } from 'date-fns';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class WithdrawController {
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
        start_date: null,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ error: 'Not found order, or order already get out delivery' });
    }

    /**
     * Check limit orders per day
     */
    const checkLimit = await Order.findAll({
      where: {
        deliveryman_id: req.params.deliveryman_id,
        canceled_at: null,
        end_date: null,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (checkLimit.length >= 5) {
      return res.status(404).json({ error: 'Delivery limit reached' });
    }

    /**
     * Check hours to delivery
     */
    if (
      !(isBefore(getHours(new Date()), 18) && isAfter(getHours(new Date()), 8))
    ) {
      return res
        .status(401)
        .json({ error: 'To withdraw orders is between 8:00 and 18:00' });
    }

    order.start_date = new Date().toJSON();
    await order.save();

    return res.json(order);
  }
}

export default new WithdrawController();
