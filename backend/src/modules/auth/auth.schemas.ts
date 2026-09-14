import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().trim().email("Correo inválido"),
  password: z.string().trim().min(1, "La contraseña es obligatoria"),
  captcha: z.string().min(1, "La verificación reCAPTCHA es obligatoria"),
});

export const changePasswordSchema = z.object({
  passwordActual: z.string().min(1, "La contraseña actual es obligatoria"),
  passwordNueva: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export const updateProfileSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  celular: z.string().trim().optional(),
  direccion: z.string().trim().optional()
});

export const forgotPasswordSchema = z.object({
  correo: z.string().trim().email("Correo inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "El token es obligatorio"),
  passwordNueva: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});