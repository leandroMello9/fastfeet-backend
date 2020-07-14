import * as Yup from 'yup';
import { isBefore, isAfter, parseISO, getHours } from 'date-fns';
import Sequelize from 'sequelize';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Queue from '../../lib/Queue';
import NewEmail from '../jobs/NewEmail';
import CancellationMail from '../jobs/CancellationMail';
import File from '../models/File';

class OrderController {
  async index(req, res) {
    const { product } = req.query;

    if (!product) {
      const orders = await Order.findAll({
        where: {
          canceled_at: null,
        },

        attributes: [
          'id',
          'deliveryman_id',
          'product',
          'status',
          'recipient_id',
          'signature_id',
          'start_date',
          'end_date',
        ],
        include: [
          {
            model: File,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['id', 'name'],
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['id', 'name', 'state', 'city', 'street'],
          },
        ],
      });
      res.json(orders);
    }
    const orders = await Order.findAll({
      where: { canceled_at: null, product: { [Sequelize.Op.iLike]: product } },

      attributes: [
        'id',
        'deliveryman_id',
        'product',
        'recipient_id',
        'signature_id',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'state', 'city', 'street'],
        },
      ],
    });
    if (!orders) {
      return res.status(404).json({ message: 'Order is not exist' });
    }
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      status: Yup.string().required(),
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.number().required(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValidSync(req.body))) {
      return res.status(401).json({ error: 'Erro to create validator order' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { id: req.body.deliveryman_id },
    });

    if (!deliveryman) {
      return res.status(401).json({ error: "Deliveryman don't exist" });
    }

    const recipient = await Recipient.findOne({
      where: { id: req.body.recipient_id },
    });

    if (!recipient) {
      return res.status(401).json({ error: "Recipient don't exist" });
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

    if (!isBefore(checkDate, checkEndDate)) {
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

    // Envio de email de uma nova entrega
    await Queue.add(NewEmail.key, {
      deliveryman,
      productName: req.body.product,
    });

    const order = await Order.create(req.body);
    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValidSync(req.body))) {
      return res.status(401).json({ error: 'Erro to create validator order' });
    }
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'This order not exist' });
    }

    await order.update(req.body);

    return res.json(order);
  }

  async delete(req, res) {
    const order = await Order.findOne({
      where: { id: req.params.id },
    });

    if (!order) {
      return res
        .status(400)
        .json({ error: 'Error to cancel order, check order exists' });
    }

    order.canceled_at = new Date().toJSON();
    await order.save();

    // Verificando se o entregador exist
    const deliveryman = await Deliveryman.findOne({
      where: { id: order.deliveryman_id },
    });

    const productName = order.product;

    await Queue.add(CancellationMail.key, {
      name: deliveryman.name,
      productName,
      email: deliveryman.email,
    });

    return res.json(order);
  }
}

export default new OrderController();
