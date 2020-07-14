import * as Yup from 'yup';
import Sequelize from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const { email } = req.body;
    const deliveryman = await Deliveryman.findOne({
      where: {
        email,
      },
    });

    if (deliveryman) {
      return res.status(404).json({ message: 'Deliveryman exist' });
    }
    const newDeliveryma = await Deliveryman.create(req.body);
    return res.json({
      newDeliveryma,
    });
  }

  async index(req, res) {
    const { nameDeliveryman } = req.query;
    if (!nameDeliveryman) {
      const deliveryman = await Deliveryman.findAll({
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });
      if (!deliveryman) {
        return res.json({ message: 'Deliveryman is not exist' });
      }
      return res.json(deliveryman);
    }
    const deliveryman = await Deliveryman.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: nameDeliveryman,
        },
      },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!deliveryman) {
      return res.json({ message: 'Deliveryman is not exist' });
    }
    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const { email } = req.body;

    const deliveryman = await Deliveryman.findOne({
      where: {
        email,
      },
    });
    if (!deliveryman) {
      return res.json({ message: 'deliveryman is not exist' });
    }
    await deliveryman.update(req.body);
    return res.json({ deliveryman });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: {
        id,
      },
    });
    if (!deliveryman) {
      return res.json({ message: 'Deliveryman is not exist' });
    }
    await deliveryman.destroy();
    return res.json({ message: deliveryman });
  }
}
export default new DeliverymanController();
