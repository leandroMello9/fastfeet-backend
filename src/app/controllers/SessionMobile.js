import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/authenticate';
import File from '../models/File';

class SessionControllerById {
  async store(req, res) {
    const schema = Yup.object().shape({
      idUser: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { idUser } = req.body;

    const user = await User.findByPk(idUser, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    const { id, name, email, avatar } = user;
    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionControllerById();
