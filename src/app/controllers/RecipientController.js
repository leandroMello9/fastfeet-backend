import * as Yup from 'yup';
import Sequelize from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    // Validando dados;

    const schema = Yup.object().shape({
      name: Yup.string().required(),

      street: Yup.string().required(),
      state: Yup.string().required(),
      complement: Yup.string().required(),
      number: Yup.number().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { name } = req.body;
    const recipient = await Recipient.findOne({ where: { name } });
    if (recipient) {
      return res
        .status(401)
        .json({ msg: 'Recipient has already been created' });
    }

    const newRecipient = await Recipient.create(req.body);
    return res.send({
      Sucess: newRecipient,
    });
  }

  async index(req, res) {
    // Validando dados;
    const { recipientName } = req.query;

    if (!recipientName) {
      const recipient = await Recipient.findAll();
      if (!recipient) {
        return res.status(401).json(recipient);
      }

      return res.status(200).json(recipient);
    }
    const recipient = await Recipient.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: recipientName,
        },
      },
    });
    if (!recipient) {
      return res.status(401).json(recipient);
    }

    return res.status(200).json(recipient);
  }

  async delete(req, res) {
    // Validando dados;
    const { id } = req.params;

    const recipient = await Recipient.findOne({ where: id });

    if (!recipient) {
      return res.status(401).json({ msg: 'Recipient is not exist' });
    }
    recipient.destroy();
    return res.status(200).json({ recipient });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),

      street: Yup.string().required(),
      state: Yup.string().required(),
      complement: Yup.string().required(),
      number: Yup.number().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    // Validando dados;
    const { id } = req.params;

    const recipient = await Recipient.findOne({ where: id });

    if (!recipient) {
      return res.status(401).json({ msg: 'Recipient is not exist' });
    }
    recipient.update(req.body);
    return res.status(200).json({ recipient });
  }
}

export default new RecipientController();
