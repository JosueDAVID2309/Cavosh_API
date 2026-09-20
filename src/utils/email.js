const nodemailer = require('nodemailer');

function createTransporter() {
  const pass = (process.env.MAIL_PASS || '').replace(/\s+/g, '');
  const user = (process.env.MAIL_USER || '').trim();

  // Para Gmail, usar service: 'gmail' evita problemas de puertos y STARTTLS
  if (process.env.MAIL_HOST === 'smtp.gmail.com' || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Envía un correo con el código de recuperación de contraseña.
 * @param {string} destinatario - Email del usuario
 * @param {string} codigo - Código de 6 dígitos
 */
async function enviarCodigoRecuperacion(destinatario, codigo) {
  const transporter = createTransporter();
  const user = (process.env.MAIL_USER || '').trim();

  const mailOptions = {
    from: process.env.MAIL_FROM || `Cavosh Café <${user}>`,
    to: destinatario,
    subject: 'Recuperación de contraseña — Cavosh Café',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #fafafa; border-radius: 12px; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Recupera tu contraseña</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Cavosh Café</strong>.
          Usa el siguiente código para continuar:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="
            display: inline-block;
            font-size: 40px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #1a1a1a;
            background: #f0ece4;
            padding: 16px 32px;
            border-radius: 10px;
          ">${codigo}</span>
        </div>
        <p style="color: #555; font-size: 14px;">
          Este código es válido durante <strong>15 minutos</strong>. Si no solicitaste este cambio, ignora este correo.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">© Cavosh Café — No respondas a este correo.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EMAIL] Correo de recuperación enviado a ${destinatario}. MessageId: ${info.messageId}`);
  return info;
}

/**
 * Envía un correo con el código de verificación para activar la cuenta.
 * @param {string} destinatario - Email del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} codigo - Código de 6 dígitos
 */
async function enviarCodigoVerificacionCuenta(destinatario, nombre, codigo) {
  const transporter = createTransporter();
  const user = (process.env.MAIL_USER || '').trim();

  const mailOptions = {
    from: process.env.MAIL_FROM || `Cavosh Café <${user}>`,
    to: destinatario,
    subject: 'Verifica tu cuenta — Cavosh Café',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #fafafa; border-radius: 12px; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">¡Bienvenido a Cavosh Café! ☕</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          Hola <strong>${nombre || 'amante del buen café'}</strong>, gracias por registrarte. Para verificar tu cuenta ingresa el siguiente código:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="
            display: inline-block;
            font-size: 40px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #1a1a1a;
            background: #f0ece4;
            padding: 16px 32px;
            border-radius: 10px;
          ">${codigo}</span>
        </div>
        <p style="color: #555; font-size: 14px;">
          Este código es válido durante <strong>24 horas</strong>. Si no creaste esta cuenta, puedes desestimar este mensaje.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">© Cavosh Café — No respondas a este correo.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EMAIL] Correo de verificación enviado a ${destinatario}. MessageId: ${info.messageId}`);
  return info;
}

module.exports = {
  enviarCodigoRecuperacion,
  enviarCodigoVerificacionCuenta,
};
