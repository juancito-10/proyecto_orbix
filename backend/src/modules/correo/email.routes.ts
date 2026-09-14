import { Router } from 'express'
import { sendEmail } from './email.service'

const router = Router()

router.post('/send', async (req, res) => {
  try {
    const { to, subject, html } = req.body

    if (!to || !subject || !html) {
      return res.status(400).json({
        message: 'to, subject y html son obligatorios',
      })
    }

    await sendEmail(to, subject, html)

    return res.status(200).json({
      message: 'Correo enviado correctamente',
    })
  } catch (error) {
    console.error('Error enviando correo:', error)

    return res.status(500).json({
      message: 'No se pudo enviar el correo',
    })
  }
})

export default router