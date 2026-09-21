import { Request, Response } from 'express'
import * as authService from './auth.service'

const ACCESS_TOKEN_MAX_AGE = 4 * 60 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

export async function login(
  req: Request,
  res: Response
) {
  const {
    correo,
    password,
    captcha,
  } = req.body as {
    correo: string
    password: string
    captcha: string
  }

  const result = await authService.login({
    correo,
    password,
    captcha,
  })

  res.cookie(
    'refreshToken',
    result.refreshToken,
    {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    }
  )

  res.cookie(
    'accessToken',
    result.accessToken,
    {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    }
  )

  res.status(200).json({
    success: true,
    data: {
      usuario: result.usuario,
    },
  })
}

export async function refresh(
  req: Request,
  res: Response
) {
  const refreshToken =
    req.cookies?.refreshToken

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token requerido',
    })
  }

  const result =
    await authService.refreshTokenLogic(
      refreshToken
    )

  res.cookie(
    'accessToken',
    result.accessToken,
    {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    }
  )

  res.status(200).json({
    success: true,
    message: 'Sesión renovada correctamente',
  })
}

export async function perfil(
  req: Request,
  res: Response
) {
  const usuario =
    await authService.getPerfil(
      req.user!.id
    )

  res.status(200).json({
    success: true,
    data: usuario,
  })
}

export async function changePassword(
  req: Request,
  res: Response
) {
  await authService.changePassword({
    idUsuario: req.user!.id,
    passwordActual:
      req.body.passwordActual,
    passwordNueva:
      req.body.passwordNueva,
  })

  res.status(200).json({
    success: true,
    message:
      'Contraseña actualizada correctamente',
  })
}

export async function logout(
  _req: Request,
  res: Response
) {
  res.clearCookie(
    'refreshToken',
    cookieOptions
  )

  res.clearCookie(
    'accessToken',
    cookieOptions
  )

  res.status(200).json({
    success: true,
    message:
      'Sesión cerrada correctamente',
  })
}

export async function updateProfile(
  req: Request,
  res: Response
) {
  const usuarioActualizado =
    await authService.updateProfile(
      req.user!.id,
      req.body
    )

  res.status(200).json({
    success: true,
    data: usuarioActualizado,
    message:
      'Perfil actualizado correctamente',
  })
}

export async function forgotPassword(
  req: Request,
  res: Response
) {
  await authService.forgotPassword(
    req.body.correo
  )

  res.status(200).json({
    success: true,
    message:
      'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña',
  })
}

export async function resetPassword(
  req: Request,
  res: Response
) {
  await authService.resetPassword(
    req.body.token,
    req.body.passwordNueva
  )

  res.status(200).json({
    success: true,
    message:
      'Contraseña restablecida correctamente',
  })
}