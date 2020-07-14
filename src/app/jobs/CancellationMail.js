import mail from '../../lib/mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { name, productName, email } = data;
    await mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Pedido cancelado',
      template: 'cancelled',
      context: {
        name,
        productName,
      },
    });
  }
}

export default new CancellationMail();
