import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().trim().email("Correo invÃ¡lido"),

  password: z.string().trim().min(1, "La contraseÃ±a es obligatoria"),

  captcha: z.string().min(1, "La verificaciÃ³n reCAPTCHA es obligatoria"),
});

export const changePasswordSchema = z.object({
  passwordActual: z.string().min(1, "La contraseÃ±a actual es obligatoria"),

  passwordNueva: z
    .string()
    .min(6, "La nueva contraseÃ±a debe tener al menos 6 caracteres"),
});


export const updateProfileSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  celular: z.string().trim().optional(),
  direccion: z.string().trim().optional()
});
