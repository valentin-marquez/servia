import { CSVReader } from "./csv-reader";
import { AIClient } from "./ai-client";
import { Exporter } from "./exporter";
import { OtRecord, AnalisisIA, BatchResult, AsyncResult } from "./types";
import { PARTIDAS_CATALOGO } from "./constants";

/**
 * Facade Pattern: Simplifica la interacción con el sistema
 */
export class ServiaService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async cargarCSVs(paths: string[]): Promise<AsyncResult<OtRecord[]>> {
    return CSVReader.cargarMultiples(paths);
  }

  async procesarOTs(
    records: OtRecord[],
    onProgress?: (current: number, total: number) => void
  ): Promise<BatchResult<AnalisisIA>> {
    const client = new AIClient(this.apiKey, PARTIDAS_CATALOGO);

    const notas = records.map((r) => ({
      numTarea: r.numTarea,
      nota: r.nota,
    }));

    return client.analizarBatch(notas, onProgress);
  }

  exportarCSV(resultados: AnalisisIA[], filename: string): AsyncResult<void> {
    return Exporter.guardarCSV(resultados, filename);
  }

  exportarHTML(resultados: AnalisisIA[], filename: string): AsyncResult<void> {
    return Exporter.guardarHTML(resultados, filename);
  }

  abrirHTML(resultados: AnalisisIA[], filename: string): AsyncResult<void> {
    return Exporter.guardarYAbrirHTML(resultados, filename);
  }

  static generarNombreArchivo(extension: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")
      .join("_")
      .substring(0, 19);
    return `analisis_${timestamp}.${extension}`;
  }
}