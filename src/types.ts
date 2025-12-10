export interface Partida {
  codigo: string;
  descripcion: string;
  categoria?: string;
}

export interface OtRecord {
  numTarea: string;
  categoriaOt: string;
  nota: string;
}

export interface AnalisisIA {
  numTarea: string;
  partidasDetectadas: PartidasDetectadas[];
  confianza: number;
  descripcionPrincipal?: string; 
}

export interface PartidasDetectadas {
  codigo: string;
  descripcion: string; // <-- Nuevo campo
  confianza: number;
}

export interface BatchResult<T> {
  success: T[];
  errors: BatchError[];
  stats: BatchStats;
}

export interface BatchError {
  numTarea: string;
  error: string;
}

export interface BatchStats {
  total: number;
  successful: number;
  failed: number;
  duration: number;
  avgTimePerOt: number;
}

export interface DeepSeekResponse {
  codigos: Array<{
    codigo: string;
    confianza: number;
    razon: string;
    descripcion: string;
  }>;
}

export type AsyncResult<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };