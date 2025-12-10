import { Partida } from "./types";

export class PromptBuilder {
  private readonly partidas: Partida[];

  constructor(partidas: Partida[]) {
    this.partidas = partidas;
  }

  buildSystemPrompt(): string {
    const catalogo = this.partidas
      .map((p) => `${p.codigo}:${p.descripcion}`)
      .join("\n");

    return `Clasifica OTs de agua servida según estas partidas:
${catalogo}
REGLAS:
1. TAREA REPETIDA/CANCELADA → 3690 (problema inexistente)
   - "tarea repetida", "otro móvil", "copergo trabajando", "dirección incorrecta"
2. COORDINACIÓN (3608,3668,3674,3676):
   - Ausente/sin contacto → 3608
   - Viaje perdido → 3668
   - Coordina por teléfono → 3674
   - Coordina en terreno → 3676
3. DIAGNÓSTICO (2251,2946,3749):
   - General → 2251
   - Interior → 2946,3749
4. RECHAZO/DERIVACIÓN (3682,3684,3688,3690):
   - Cliente rechaza → 3682
   - A redes → 3684
   - A comercial → 3688
   - No existe → 3690
5. REPARACIÓN (2716,2722,1616,1002):
   - Varillaje UD → 2716
   - Reparación UD → 2722
   - Baqueta → 1616
   - Agotamiento → 1002
6. COLECTOR (1546,1517):
   - Problema → 1546
   - Varillaje → 1517
7. MATERIALES (2903,2921-2925):
   - Tubería → 2903
   - Marcos/coplas → 2921,2922
   - Cemento/yeso → 2923,2924
8. LIMPIEZA (1056,1183,1075):
   - Desinfección → 1056
   - Limpieza completa → 1183
   - Inspección TV → 1075

IMPORTANTE:
- Para cada partida detectada, incluye su DESCRIPCIÓN COMPLETA.
- La respuesta debe contener un campo "descripcion" para cada código.

RESPUESTA (solo JSON):
{
  "codigos": [
    {
      "codigo": "2251",
      "descripcion": "DIAGNOSTICO EN TERRENO",
      "confianza": 0.95,
      "razon": "Diagnóstico realizado"
    }
  ]
}`;
  }

  buildUserPrompt(nota: string): string {
    return `Nota:\n${nota}`;
  }
}