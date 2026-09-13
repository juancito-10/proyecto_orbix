import { z } from 'zod'

import { EstadoGeneral, RolUsuario } from '@prisma/client'

export const createUsuarioSchema = z.object({
  codigoEmpleado: z
    .string()
    .trim()
    .max(50)
    .optional(),

  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(150),

  correo: z
    .string()
    .trim()
    .email('Correo inválido')
    .max(120),

  celular: z
    .string()
    .trim()
    .max(30)
    .optional(),

  ciudad: z
    .string()
    .trim()
    .max(100)
    .optional(),

  fechaIngreso: z
    .coerce
    .date()
    .optional(),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255),

  rol: z
    .nativeEnum(RolUsuario)
    .optional(),

  estado: z
    .nativeEnum(EstadoGeneral)
    .optional(),
})

export const updateUsuarioSchema = z.object({
  codigoEmpleado: z
    .string()
    .trim()
    .max(50)
    .optional(),

  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(150)
    .optional(),

  correo: z
    .string()
    .trim()
    .email('Correo inválido')
    .max(120)
    .optional(),

  celular: z
    .string()
    .trim()
    .max(30)
    .optional(),

  ciudad: z
    .string()
    .trim()
    .max(100)
    .optional(),

  fechaIngreso: z
    .coerce
    .date()
    .optional(),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255)
    .optional(),

  rol: z
    .nativeEnum(RolUsuario)
    .optional(),

  estado: z
    .nativeEnum(EstadoGeneral)
    .optional(),
})