import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.EMAIL_FROM || 'Revista Laboratorio <noreply@revistalaboratorio.com.ar>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://revistalaboratorio.com.ar'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Revista Laboratorio'

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #191919; color: #E8E8E8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { border-bottom: 1px solid #373737; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #D4B896; letter-spacing: 2px; text-transform: uppercase; }
    .content { color: #E8E8E8; line-height: 1.7; }
    .content h2 { color: #E8E8E8; font-size: 22px; margin-bottom: 8px; }
    .content p { color: #A0A0A0; margin: 0 0 16px; }
    .btn { display: inline-block; background: #D4B896; color: #191919; padding: 12px 28px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #373737; color: #666666; font-size: 13px; }
    .footer a { color: #D4B896; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${SITE_NAME}</h1>
    </div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>Recibiste este email porque estás suscripto a ${SITE_NAME}.</p>
      <p><a href="${SITE_URL}">Visitar el sitio</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function sendNewPostNewsletter(
  subscribers: string[],
  post: { title: string; excerpt: string | null; slug: string; authorName: string | null }
) {
  if (!subscribers.length) return

  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const content = `
    <h2>${post.title}</h2>
    <p>Por ${post.authorName || 'el equipo de ' + SITE_NAME}</p>
    <p>${post.excerpt || 'Nueva entrada disponible en ' + SITE_NAME}</p>
    <a href="${postUrl}" class="btn">Leer entrada →</a>
  `

  const chunkSize = 50
  for (let i = 0; i < subscribers.length; i += chunkSize) {
    const chunk = subscribers.slice(i, i + chunkSize)
    await transporter.sendMail({
      from: FROM,
      bcc: chunk.join(','),
      subject: `Nueva entrada: ${post.title} | ${SITE_NAME}`,
      html: baseTemplate(content),
    })
  }
}

export async function sendInvitationEmail(email: string, token: string, inviterName: string) {
  const registerUrl = `${SITE_URL}/register?token=${token}`
  const content = `
    <h2>Fuiste invitado a ${SITE_NAME}</h2>
    <p>${inviterName} te invitó a crear una cuenta en ${SITE_NAME} y publicar tus propios escritos.</p>
    <p>Usá el siguiente enlace para registrarte (válido por 7 días):</p>
    <a href="${registerUrl}" class="btn">Aceptar invitación →</a>
    <p style="margin-top:16px; font-size:13px; color:#666">O copiá este enlace: ${registerUrl}</p>
  `

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Invitación a ${SITE_NAME}`,
    html: baseTemplate(content),
  })
}

export async function sendSubscriptionConfirmation(email: string) {
  const content = `
    <h2>¡Gracias por suscribirte!</h2>
    <p>Te registraste para recibir las nuevas entradas de ${SITE_NAME} en tu email.</p>
    <p>Recibirás un email cada vez que publiquemos algo nuevo.</p>
    <a href="${SITE_URL}" class="btn">Visitar ${SITE_NAME} →</a>
  `

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Suscripción confirmada | ${SITE_NAME}`,
    html: baseTemplate(content),
  })
}
