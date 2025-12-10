import { writeFileSync } from "fs";
import { stringify } from "csv-stringify/sync";
import { exec } from "child_process";
import { AnalisisIA, AsyncResult } from "./types";
import { HTMLGenerator } from "./html-generator";

export class Exporter {
  static guardarCSV(resultados: AnalisisIA[], filename: string): AsyncResult<void> {
    try {
      const data = resultados.map((r) => ({
        "Num Tarea": r.numTarea,
        "Partidas": r.partidasDetectadas
          .map((p) => `${p.codigo}(${(p.confianza * 100).toFixed(0)}%)`)
          .join(", ") || "Sin partidas",
        "Confianza": r.confianza
          ? `${(r.confianza * 100).toFixed(1)}%`
          : "0%",
      }));

      const csv = stringify(data, {
        header: true,
        delimiter: ";",
        quoted: true,
      });

      writeFileSync(filename, csv, "utf-8");
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error CSV",
      };
    }
  }

  static guardarHTML(resultados: AnalisisIA[], filename: string): AsyncResult<void> {
    try {
      const html = HTMLGenerator.generar(resultados);
      writeFileSync(filename, html, "utf-8");
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error HTML",
      };
    }
  }

  static abrirHTML(filename: string): void {
    const platform = process.platform;

    if (platform === "win32") {
      exec(`start "" "${filename}"`);
    } else if (platform === "darwin") {
      exec(`open "${filename}"`);
    } else {
      exec(`xdg-open "${filename}"`);
    }
  }

  static guardarYAbrirHTML(
    resultados: AnalisisIA[],
    filename: string
  ): AsyncResult<void> {
    const saveResult = this.guardarHTML(resultados, filename);
    if (!saveResult.success) return saveResult;

    try {
      this.abrirHTML(filename);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al abrir",
      };
    }
  }
}