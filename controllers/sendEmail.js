const nodemailer = require('nodemailer'); // бібліотека, що вміє говорити з поштовим сервером по SMTP

// Уроки 260–262: тестовий лист через Ethereal — фейкову скриньку, лист нікуди не йде
const sendEmailEthereal = async (req, res) => {
  const testAccount = await nodemailer.createTestAccount(); // одноразовий логін/пароль Ethereal, без реєстрації

  // transporter — налаштоване з'єднання з SMTP-сервером; через нього йдуть усі листи
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587, // стандартний порт для відправки пошти з шифруванням STARTTLS
    auth: {
      user: testAccount.user, // у курсі тут захардкожений акаунт автора — він не спрацює
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Ilya Bielov" <ilya@example.com>',
    to: 'bar@example.com',
    subject: 'Hello',
    html: '<h2>Sending Emails with Node.js</h2>',
  });

  // preview — посилання, де можна відкрити цей лист у браузері (працює лише з Ethereal)
  res.json({ info, preview: nodemailer.getTestMessageUrl(info) });
};

// Уроки 263–265: справжній лист. У курсі — SendGrid (@sendgrid/mail), у нас — Twilio Email API,
// бо нові акаунти SendGrid потрапляють у консоль Twilio і ключа SG. не отримують
const sendEmail = async (req, res) => {
  const sid = process.env.TWILIO_ACCOUNT_SID; // секрети беремо з .env, а не пишемо в код
  const token = process.env.TWILIO_AUTH_TOKEN;

  // SMTP тут не потрібен: лист відправляється одним HTTP-запитом (fetch вбудований у Node 22)
  const response = await fetch('https://comms.twilio.com/v1/Emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Basic auth: "логін:пароль" у base64 — те саме, що curl --user 'SID:TOKEN'
      Authorization:
        'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
    },
    body: JSON.stringify({
      from: { address: `${sid}@twilio.email`, name: 'Ilya Bielov' }, // у trial адреса відправника фіксована
      to: [{ address: process.env.EMAIL_TO }], // масив — одержувачів може бути кілька
      // Trial-акаунт Twilio приймає лише текст затвердженого шаблону
      // (сторінка "Try out Email" → Template); свій текст дає 400.
      content: {
        subject: 'Your Order Has Been Confirmed!',
        html:
          '<p><b>This is a test email from Twilio.</b></p>' +
          '<h2>Thank you for your order!</h2>' +
          '<p>We are excited to let you know that your order has been confirmed and is being processed.</p>' +
          '<p>You will receive a shipping confirmation email once your items are on their way.</p>' +
          '<p>Order Number: #12345</p>' +
          '<p>Thank you for shopping with us!</p>' +
          '<p>Best regards,<br/>The Team</p>',
      },
    }),
  });

  const info = await response.json();
  // fetch не кидає помилку на 400/401, тому передаємо статус Twilio далі як є
  res.status(response.status).json(info);
};

module.exports = sendEmail; // як у курсі: експортуємо лише справжню відправку, Ethereal лишився для прикладу
