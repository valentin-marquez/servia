import OpenAI from "openai";
import {
  Partida,
  AnalisisIA,
  DeepSeekResponse,
  BatchResult,
  BatchError,
  PartidasDetectadas,
} from "./types";
import { PromptBuilder } from "./prompt-builder";
import { AI_CONFIG, TAREA_REPETIDA_KEYWORDS } from "./constants";

export class AIClient {
  private readonly openai: OpenAI;
  private readonly promptBuilder: PromptBuilder;
  private readonly partidas: Partida[];

  constructor(apiKey: string, partidas: Partida[]) {
    this.partidas = partidas;
    this.promptBuilder = new PromptBuilder(partidas);
    this.openai = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com/v1",
      timeout: AI_CONFIG.TIMEOUT,
    });
  }

  async analizar(numTarea: string, nota: string): Promise<AnalisisIA> {
    try {
      // Detección rápida de tarea repetida
      if (this.esTareaRepetida(nota)) {
        return this.buildTareaRepetidaResult(numTarea);
      }

      const response = await this.callWithRetry(nota);
      const partidas = this.extractPartidas(response);

      const confianza = this.calcConfianza(partidas);
      const partidaMasConfiable = partidas.reduce((max, p) => p.confianza > max.confianza ? p : max, partidas[0] || { confianza: 0 });

      const descripcionPrincipal = partidaMasConfiable?.descripcion || "Sin descripción";

      return {
      numTarea,
      partidasDetectadas: partidas,
      confianza,
      descripcionPrincipal, // <-- Asignar el nuevo campo
    };
    } catch (error) {
      return this.buildErrorResult(numTarea, error);
    }
  }

  async analizarBatch(
    notas: Array<{ numTarea: string; nota: string }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<BatchResult<AnalisisIA>> {
    const startTime = Date.now();
    const results: AnalisisIA[] = [];
    const errors: BatchError[] = [];

    for (let i = 0; i < notas.length; i += AI_CONFIG.BATCH_SIZE) {
      const batch = notas.slice(i, i + AI_CONFIG.BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map(({ numTarea, nota }) => this.analizar(numTarea, nota))
      );

      batchResults.forEach((result, idx) => {
        const currentIdx = i + idx;

        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          errors.push({
            numTarea: batch[idx].numTarea,
            error: result.reason?.message || "Error",
          });
        }

        if (onProgress) onProgress(currentIdx + 1, notas.length);
      });

      if (i + AI_CONFIG.BATCH_SIZE < notas.length) {
        await this.delay(AI_CONFIG.BATCH_DELAY);
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: results,
      errors,
      stats: {
        total: notas.length,
        successful: results.length,
        failed: errors.length,
        duration,
        avgTimePerOt: duration / notas.length,
      },
    };
  }

  private esTareaRepetida(nota: string): boolean {
    const notaLower = nota.toLowerCase();
    return TAREA_REPETIDA_KEYWORDS.some((kw) => notaLower.includes(kw));
  }

  private buildTareaRepetidaResult(numTarea: string): AnalisisIA {
    return {
      numTarea,
      partidasDetectadas: [
        {
          codigo: "3690",
          descripcion: "PROBLEMA INEXISTENTE",
          confianza: 0.98,
        },
      ],
      confianza: 0.98,
    };
  }

  private async callWithRetry(
    nota: string,
    retries = 0
  ): Promise<DeepSeekResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        messages: [
          {
            role: "system",
            content: this.promptBuilder.buildSystemPrompt(),
          },
          {
            role: "user",
            content: this.promptBuilder.buildUserPrompt(nota),
          },
        ],
      });

      const content = completion.choices[0]?.message?.content || "";
      return this.parseResponse(content);
    } catch (error) {
      if (retries < AI_CONFIG.MAX_RETRIES) {
        await this.delay(Math.pow(2, retries) * 1000);
        return this.callWithRetry(nota, retries + 1);
      }
      throw error;
    }
  }

  private parseResponse(content: string): DeepSeekResponse {
    const clean = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(clean) as DeepSeekResponse;

      if (!parsed.codigos || !Array.isArray(parsed.codigos)) {
        throw new Error("Estructura inválida");
      }

      parsed.codigos = parsed.codigos.filter(({ codigo }) =>
        this.partidas.some((p) => p.codigo === codigo)
      );

      return parsed;
    } catch {
      return this.extractFromText(clean);
    }
  }

  private extractFromText(text: string): DeepSeekResponse {
    const codigos: DeepSeekResponse["codigos"] = [];

    for (const partida of this.partidas) {
      const regex = new RegExp(`\\b${partida.codigo}\\b`, "i");
      if (regex.test(text)) {
        codigos.push({
          codigo: partida.codigo,
          confianza: 0.6,
          razon: "Extraído de texto",
        });
      }
    }

    return { codigos };
  }

  private extractPartidas(response: DeepSeekResponse): PartidasDetectadas[] {
  return response.codigos.map(({ codigo, confianza, descripcion }) => {
    // Si la IA no devolvió la descripción, buscarla en el catálogo
    const partida = this.partidas.find((p) => p.codigo === codigo);
    const desc = descripcion || partida?.descripcion || "Sin descripción";
    return {
      codigo,
      descripcion: desc,
      confianza: Math.max(0, Math.min(1, confianza)),
    };
  });
}

  private calcConfianza(partidas: PartidasDetectadas[]): number {
    if (partidas.length === 0) return 0;
    return partidas.reduce((sum, p) => sum + p.confianza, 0) / partidas.length;
  }

  private buildErrorResult(numTarea: string, error: unknown): AnalisisIA {
    return {
      numTarea,
      partidasDetectadas: [],
      confianza: 0,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}