import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      name: Yup.string().required(),
      password: Yup.string()
        .required('')
        .min(6),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User exist' });
    }
    const { name, password } = await User.create(req.body);
    return res.json({
      name,
      email,
      password,
    });
  }

  async index(req, res) {
    const user = await User.findAll();
    if (!user) {
      return res.json({ message: 'User is not exist' });
    }
    return res.json({ user });
  }

  async update(req, res) {
    const { id } = req.params;
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      name: Yup.string().required(),
      password: Yup.string()
        .required('')
        .min(6),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.json({ message: 'User is not exist' });
    }
    await user.update(req.body);
    return res.json({ user });
  }

  async delete(req, res) {
    const { id } = req.params;
    const user = await User.findOne({ id });
    if (!user) {
      return res.json({ message: 'User is not exist' });
    }
    await user.destroy();
    return res.json({ message: 'User delet sucess', user });
  }
}
export default new UserController();
