const nodemailer = require('nodemailer');
const pug = require('pug');
const htmltoText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Andres Q <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SendGrid
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    //Render HTML Template
    const html = pug.renderFile(`${__dirname}/../views/email${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmltoText.fromString(html)
    };
    //3- Send Email
    const transporter = this.createTransport();
    await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async resetPassword() {
    await this.send('resetPassword', 'Reset Password Requested');
  }
};
