import { Partida } from "./types";

export const PARTIDAS_CATALOGO: Partida[] = [
  { codigo: "2251", descripcion: "DIAGNOSTICO EN TERRENO", categoria: "diagnostico" },
  { codigo: "3608", descripcion: "CLIENTE AUSENTE/SIN CONTACTO", categoria: "coordinacion" },
  { codigo: "3668", descripcion: "VIAJE PERDIDO", categoria: "coordinacion" },
  { codigo: "3674", descripcion: "COORDINACION TELEFONICA", categoria: "coordinacion" },
  { codigo: "3676", descripcion: "COORDINACION EN TERRENO", categoria: "coordinacion" },
  { codigo: "3682", descripcion: "CLIENTE RECHAZA SOLUCION", categoria: "rechazo" },
  { codigo: "3684", descripcion: "DERIVAR A CONTRATO REDES", categoria: "derivacion" },
  { codigo: "3688", descripcion: "DERIVAR A COMERCIAL", categoria: "derivacion" },
  { codigo: "3690", descripcion: "PROBLEMA INEXISTENTE", categoria: "rechazo" },
  { codigo: "2946", descripcion: "PROBLEMA TRAMO INTERIOR", categoria: "diagnostico" },
  { codigo: "3749", descripcion: "DIAGNOSTICO INTERIOR", categoria: "diagnostico" },
  { codigo: "1075", descripcion: "INSPECCION TV", categoria: "inspeccion" },
  { codigo: "2716", descripcion: "VARILLAJE UD", categoria: "reparacion" },
  { codigo: "2722", descripcion: "REPARACION UD", categoria: "reparacion" },
  { codigo: "1616", descripcion: "REPARACION BAQUETA", categoria: "reparacion" },
  { codigo: "2903", descripcion: "TUBERIA 110", categoria: "materiales" },
  { codigo: "2922", descripcion: "COPLA", categoria: "materiales" },
  { codigo: "2924", descripcion: "YESO", categoria: "materiales" },
  { codigo: "2923", descripcion: "CEMENTO", categoria: "materiales" },
  { codigo: "2925", descripcion: "MODULO 600X300", categoria: "materiales" },
  { codigo: "2921", descripcion: "MARCO CUADRADO REFORZADO", categoria: "materiales" },
  { codigo: "2919", descripcion: "MARCO CUADRADO", categoria: "materiales" },
  { codigo: "1002", descripcion: "AGOTAMIENTO", categoria: "reparacion" },
  { codigo: "1546", descripcion: "PROBLEMA COLECTOR", categoria: "colector" },
  { codigo: "1517", descripcion: "VARILLAJE COLECTOR", categoria: "colector" },
  { codigo: "1056", descripcion: "DESINFECCION", categoria: "limpieza" },
  { codigo: "1183", descripcion: "LIMPIEZA Y DESINFECCION", categoria: "limpieza" },
];

export const CSV_CONFIG = {
  REQUIRED_COLUMNS: ["Num tarea", "Categoría OT", "Nota"],
  AGUA_SERVIDA_KEYWORDS: ["AGUA SERVIDA", "AS", "AGUAS SERVIDAS"],
  DELIMITER: ";",
  ENCODING: "utf-8" as BufferEncoding,
};

export const AI_CONFIG = {
  MODEL: "deepseek-chat",
  TEMPERATURE: 0.2,
  MAX_TOKENS: 800,
  MAX_RETRIES: 3,
  TIMEOUT: 30000,
  BATCH_SIZE: 5,
  BATCH_DELAY: 1000,
};

export const TAREA_REPETIDA_KEYWORDS = [
  "tarea repetida",
  "ya ejecutada",
  "otro movil",
  "copergo trabajando",
  "problema inexistente",
  "direccion incorrecta",
  "dirección incorrecta",
];