import nodemailer from 'nodemailer';
import exphbs from 'express-handlebars';
import { resolve } from 'path';
import nodemailerhbs from 'nodemailer-express-handlebars';
import configMail from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = configMail;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });

    this.templateConfigure();
  }

  templateConfigure() {
    const pathExpress = resolve(__dirname, '..', 'app', 'views', 'email');

    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(pathExpress, 'layouts'),
          partialsDir: resolve(pathExpress, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        pathExpress,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    this.transporter.sendMail({
      ...configMail.default,
      ...message,
    });
  }
}

export default new Mail();
