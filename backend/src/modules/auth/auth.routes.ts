import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import { validate } from '../../middlewares/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import * as authController from './auth.controller'
import { changePasswordSchema, loginSchema, updateProfileSchema } from './auth.schemas'

import { rateLimit } from 'express-rate-limit'

const router = Router()

const loginLimiter1 = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 5, // Límite de 5 intentos
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos fallidos. Por favor intente de nuevo en 5 minutos.' }
})

const loginLimiter2 = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  limit: 10, // Si llega a 10 (es decir, falla otros 5), se bloquea por 30 mins
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Ha excedido el límite de seguridad. Por favor intente de nuevo en 30 minutos.' }
})

router.post('/login', loginLimiter2, loginLimiter1, validate({ body: loginSchema }), asyncHandler(authController.login))
router.post('/refresh', asyncHandler(authController.refresh))
router.post('/logout', asyncHandler(authController.logout))

router.get('/me', authenticate, asyncHandler(authController.perfil))

router.patch('/me', authenticate, validate({ body: updateProfileSchema }), asyncHandler(authController.updateProfile))

router.patch(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword),
)

export default router

