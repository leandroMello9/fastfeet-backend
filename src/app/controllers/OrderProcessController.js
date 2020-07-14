import * as Yup from 'yup';
import { isBefore, isAfter, parseISO, getHours } from 'date-fns';
import { Op } from 'sequelize';
import Order from '../models/Order';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class OrderProcessController {
  async index(req, res) {
    /**
     * Check deliveryman exist
     */
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Not found deliveryman' });
    }

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: { [Op.eq]: null },
        end_date: { [Op.eq]: null },
      },
      attributes: ['id', 'product', 'recipient_id', 'signature_id'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
      ],
    });
    return res.json(orders);
  }

  async update(req, res) {
    /**
     * Check if order exists
     */
    const order = await Order.findOne({
      where: { id: req.params.order_id, end_date: null, canceled_at: null },
    });

    if (!order) {
      return res.status(404).json({ error: 'Not found order' });
    }

    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.date(),
    });

    if (!(await schema.isValidSync(req.body))) {
      return res.status(404).json({ error: 'Error to update order' });
    }

    const { start_date, end_date } = req.body;

    /**
     * Check date do delivery
     */
    const checkDate = parseISO(start_date);
    const checkEndDate = parseISO(end_date);

    if (isBefore(checkDate, new Date())) {
      return res
        .status(401)
        .json({ error: 'Start date not less than date now' });
    }

    if (order.start_date && isBefore(checkEndDate, order.start_date)) {
      return res
        .status(401)
        .json({ error: 'End date not less than start date' });
    }

    /**
     * Check hours to delivery
     */

    const checkTimeStart = new Date();

    if (
      !(
        isBefore(getHours(checkTimeStart), 18) &&
        isAfter(getHours(checkTimeStart), 8)
      )
    ) {
      return res
        .status(401)
        .json({ error: 'To withdraw orders is between 8:00 and 18:00' });
    }

    await order.update(req.body);

    return res.json(order);
  }

  async show(req, res) {
    /**
     * Check deliveryman exist
     */
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Not found deliveryman' });
    }
    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: { [Op.eq]: null },
        end_date: { [Op.not]: null },
      },
      attributes: ['id', 'product', 'recipient_id', 'signature_id'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'state', 'city'],
        },
      ],
    });
    return res.json(orders);
  }
}

export default new OrderProcessController();
