export interface Profesional {
  id?: number;
  descripcion?: string | null;
  profesion?: string | null;
  foto?: string | null;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  role: "profesional" | "cliente";
  foto?: string | null;
  profesional?: Profesional;
}

export interface Servicio {
  id: number;
  nombre: string;
  tipo: string;
  modalidad: "presencial" | "virtual" | "hibrida";
  precio: number;
  duracion_minutos: number;
  descripcion?: string | null;
  direccion?: string | null;
  videollamada?: boolean;
  activo?: boolean;
}

export interface ProfesionalConUser extends Profesional {
  user: Omit<User, "profesional">;
  puntuacion_promedio?: number;
}

export interface ServicioConProfesional extends Servicio {
  profesional: ProfesionalConUser;
}
