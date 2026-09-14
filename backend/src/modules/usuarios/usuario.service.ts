import bcrypt from "bcryptjs";

import { prisma } from "../../config/prisma";

import { ApiError } from "../../utils/ApiError";

import {
  buildMeta,
  getPagination,
} from "../../utils/pagination";

import type {
  EstadoGeneral,
  RolUsuario,
} from "@prisma/client";

type CreateUsuarioInput = {
  nombre: string;
  correo: string;
  celular?: string;
  ciudad?: string;
  fechaIngreso?: Date;
  password: string;
  rol?: RolUsuario;
  estado?: EstadoGeneral;
};

type UpdateUsuarioInput = Partial<
  Omit<CreateUsuarioInput, "password"> & {
    password?: string;
    codigoEmpleado?: string;
  }
>;

type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

const safeSelect = {
  idUsuario: true,
  codigo_empleado: true,
  nombre: true,
  correo: true,
  celular: true,
  ciudad: true,
  fechaIngreso: true,
  rol: true,
  estado: true,
  createdAt: true,
  updatedAt: true,
} as const;

function formatUsuario(usuario: any) {
  return {
    idUsuario: usuario.idUsuario,

    codigoEmpleado:
      usuario.codigo_empleado ?? null,

    nombre: usuario.nombre,

    correo: usuario.correo,

    celular:
      usuario.celular ?? null,

    ciudad:
      usuario.ciudad ?? null,

    fechaIngreso:
      usuario.fechaIngreso ?? null,

    rol: usuario.rol,

    estado: usuario.estado,

    createdAt: usuario.createdAt,

    updatedAt: usuario.updatedAt,
  };
}

async function generarCodigoEmpleado() {
  const usuarios =
    await prisma.usuario.findMany({
      select: {
        codigo_empleado: true,
      },
    });

  let mayorNumero = 0;

  for (const usuario of usuarios) {
    if (!usuario.codigo_empleado) {
      continue;
    }

    const coincidencia =
      usuario.codigo_empleado.match(
        /^EMP-(\d+)$/
      );

    if (!coincidencia) {
      continue;
    }

    const numero =
      Number(coincidencia[1]);

    if (numero > mayorNumero) {
      mayorNumero = numero;
    }
  }

  const siguienteNumero =
    mayorNumero + 1;

  return `EMP-${String(
    siguienteNumero
  ).padStart(3, "0")}`;
}

export async function create(
  data: CreateUsuarioInput
) {
  const passwordHash =
    await bcrypt.hash(
      data.password,
      10
    );

  const codigoEmpleado =
    await generarCodigoEmpleado();

  const usuario =
    await prisma.usuario.create({
      data: {
        codigo_empleado:
          codigoEmpleado,

        nombre:
          data.nombre,

        correo:
          data.correo,

        celular:
          data.celular,

        ciudad:
          data.ciudad,

        fechaIngreso:
          data.fechaIngreso,

        passwordHash,

        rol:
          data.rol,

        estado:
          data.estado,
      },

      select: safeSelect,
    });

  return formatUsuario(usuario);
}

export async function list(
  query: ListQuery
) {
  const {
    page,
    limit,
    skip,
  } = getPagination(query);

  const search =
    query.search?.trim();

  const where = search
    ? {
        OR: [
          {
            nombre: {
              contains: search,
              mode:
                "insensitive" as const,
            },
          },
          {
            correo: {
              contains: search,
              mode:
                "insensitive" as const,
            },
          },
          {
            codigo_empleado: {
              contains: search,
              mode:
                "insensitive" as const,
            },
          },
          {
            ciudad: {
              contains: search,
              mode:
                "insensitive" as const,
            },
          },
          {
            celular: {
              contains: search,
              mode:
                "insensitive" as const,
            },
          },
        ],
      }
    : undefined;

  const [
    total,
    items,
  ] = await Promise.all([
    prisma.usuario.count({
      where,
    }),

    prisma.usuario.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: safeSelect,
    }),
  ]);

  return {
    items:
      items.map(formatUsuario),

    meta: buildMeta(
      page,
      limit,
      total
    ),
  };
}

export async function getById(
  id: string
) {
  const usuario =
    await prisma.usuario.findUnique({
      where: {
        idUsuario: id,
      },

      select: safeSelect,
    });

  if (!usuario) {
    throw ApiError.notFound(
      "Usuario no encontrado"
    );
  }

  return formatUsuario(usuario);
}

export async function update(
  id: string,
  data: UpdateUsuarioInput
) {
  await getById(id);

  const {
    password,
    codigoEmpleado,
    ...rest
  } = data;

  const payload = {
    ...rest,

    ...(codigoEmpleado !== undefined
      ? {
          codigo_empleado:
            codigoEmpleado,
        }
      : {}),

    ...(password
      ? {
          passwordHash:
            await bcrypt.hash(
              password,
              10
            ),
        }
      : {}),
  };

  const usuario =
    await prisma.usuario.update({
      where: {
        idUsuario: id,
      },

      data: payload,

      select: safeSelect,
    });

  return formatUsuario(usuario);
}

export async function remove(
  id: string,
  requesterId: string
) {
  if (id === requesterId) {
    throw ApiError.badRequest(
      "No puedes eliminar tu propio usuario"
    );
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        idUsuario: id,
      },
    });

  if (!usuario) {
    throw ApiError.notFound(
      "Usuario no encontrado"
    );
  }

  if (usuario.rol === "admin") {
    const admins =
      await prisma.usuario.count({
        where: {
          rol: "admin",
          estado: "activo",
        },
      });

    if (admins <= 1) {
      throw ApiError.conflict(
        "No se puede eliminar el último administrador activo"
      );
    }
  }

  await prisma.usuario.delete({
    where: {
      idUsuario: id,
    },
  });
}