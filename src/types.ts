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
