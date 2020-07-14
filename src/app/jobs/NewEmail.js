import mail from '../../lib/mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { deliveryman, productName } = data;
    await mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Novo pedido',
      template: 'recive',
      context: {
        name: deliveryman.name,
        productName,
      },
    });
  }
}

export default new NewOrderMail();
