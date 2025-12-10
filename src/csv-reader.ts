import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { OtRecord, AsyncResult } from "./types";
import { CSV_CONFIG } from "./constants";

export class CSVReader {
  static async cargarMultiples(paths: string[]): Promise<AsyncResult<OtRecord[]>> {
    try {
      const allRecords: OtRecord[] = [];

      for (const path of paths) {
        const result = await this.cargar(path);
        if (!result.success) return result;
        allRecords.push(...result.data);
      }

      return { success: true, data: allRecords };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  static async cargar(path: string): Promise<AsyncResult<OtRecord[]>> {
    try {
      const content = this.readWithEncoding(path);
      const config = this.detectConfig(content);
      const records = this.parse(content, config);

      const validation = this.validate(records);
      if (!validation.success) return validation;

      const filtered = this.filterAguaServida(records);

      return { success: true, data: filtered };
    } catch (error) {
      return {
        success: false,
        error: `Error CSV: ${error instanceof Error ? error.message : ""}`,
      };
    }
  }

  private static readWithEncoding(path: string): string {
    const buffer = readFileSync(path);

    // UTF-16 LE con BOM
    if (buffer[0] === 0xff && buffer[1] === 0xfe) {
      let content = buffer.toString("utf16le");
      if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
      return content;
    }

    // UTF-8 con BOM
    if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
      return buffer.slice(3).toString("utf-8");
    }

    return buffer.toString("utf-8");
  }

  private static detectConfig(content: string) {
    const firstLine = content.split("\n")[0] || "";

    let delimiter = CSV_CONFIG.DELIMITER;
    if (firstLine.includes("\t")) delimiter = "\t";
    else if (firstLine.includes(",") && !firstLine.includes(";"))
      delimiter = ",";

    return { delimiter };
  }

  private static parse(content: string, config: { delimiter: string }) {
    return parse(content, {
      delimiter: config.delimiter,
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    }) as Array<Record<string, string>>;
  }

  private static validate(
    records: Array<Record<string, string>>
  ): AsyncResult<OtRecord[]> {
    if (records.length === 0) {
      return { success: false, error: "CSV vacío" };
    }

    const columns = Object.keys(records[0]);
    const missing = CSV_CONFIG.REQUIRED_COLUMNS.filter(
      (req) => !columns.includes(req)
    );

    if (missing.length > 0) {
      return { success: false, error: `Faltan columnas: ${missing.join(", ")}` };
    }

    return { success: true, data: [] };
  }

  private static filterAguaServida(
    records: Array<Record<string, string>>
  ): OtRecord[] {
    return records
      .map((record) => {
        const categoriaOt = (
          record["Categoría OT"] ||
          record["CategorÃ­a OT"] ||
          record["CategorÃƒÂ­a OT"] ||
          ""
        ).toUpperCase();

        const isAS = CSV_CONFIG.AGUA_SERVIDA_KEYWORDS.some((kw) =>
          categoriaOt.includes(kw)
        );

        if (!isAS) return null;

        return {
          numTarea: record["Num tarea"] || "",
          categoriaOt,
          nota: record["Nota"] || "",
        };
      })
      .filter((r): r is OtRecord => r !== null);
  }
}