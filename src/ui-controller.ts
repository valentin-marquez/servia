import blessed from "blessed";
import { execSync } from "child_process";
import { ServiaService } from "./servia-service";
import { OtRecord, AnalisisIA } from "./types";

/**
 * Controller Pattern: Maneja la lógica de UI con Blessed
 */
export class UIController {
  private readonly screen: blessed.Widgets.Screen;
  private service?: ServiaService;
  private records: OtRecord[] = [];
  private resultados: AnalisisIA[] = [];

  // Colores de tema
  private readonly theme = {
    primary: "cyan",
    secondary: "blue",
    accent: "yellow",
    success: "green",
    error: "red",
    text: "white",
    gray: "gray",
    bgHeader: "blue",
  };

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Servia - Análisis de OTs",
      fullUnicode: true,
    });

    this.screen.key(["q", "Q", "C-c"], () => {
      this.screen.destroy();
      process.exit(0);
    });

    this.mostrarInicio();
  }

  private clear(): void {
    this.screen.children.forEach((c) => c.destroy());
  }

  // --- COMPONENTES UI REUTILIZABLES ---

  private crearHeader(texto: string, color: string = this.theme.bgHeader): blessed.Widgets.BoxElement {
    return blessed.box({
      top: 0,
      width: "100%",
      height: 3,
      content: `{center}{bold}${texto}{/bold}{/center}`,
      tags: true,
      style: { bg: color, fg: "white", bold: true },
      border: { type: "line" }, // Borde sutil
    });
  }

  private crearFooter(opciones: string[]): blessed.Widgets.BoxElement {
    const content = opciones
      .map((op) => `{${this.theme.accent}-fg}[${op.charAt(1)}]{/${this.theme.accent}-fg} ${op.substring(4)}`)
      .join("  |  ");

    return blessed.box({
      bottom: 0,
      width: "100%",
      height: 3,
      content: `{center}${content}  |  {red-fg}[Q]{/red-fg} Salir{/center}`,
      tags: true,
      border: { type: "line" },
      style: { border: { fg: this.theme.gray }, fg: this.theme.gray },
    });
  }

  // --- PANTALLAS ---

  private mostrarInicio(): void {
    this.clear();

    const logo = blessed.box({
      top: "center",
      left: "center",
      width: "80%",
      height: "70%",
      content: this.getLogoContent(),
      tags: true,
      border: { type: "line" },
      style: { 
        border: { fg: this.theme.primary }, 
        fg: this.theme.text 
      },
      padding: 1,
    });

    const footer = this.crearFooter(["[C] Cargar CSV"]);

    this.screen.append(logo);
    
    this.screen.append(footer);

    this.screen.key(["c", "C"], () => this.cargarCSV());
    this.screen.render();
  }

  private getLogoContent(): string {
    return `
{center}{bold}{cyan-fg}
   _____   ______   _____    __      __  _____           
  / ____| |  ____| |  __ \\   \\ \\    / / |_   _|   /\\     
 | (___   | |__    | |__) |   \\ \\  / /    | |    /  \\    
  \\___ \\  |  __|   |  _  /     \\ \\/ /     | |   / /\\ \\   
  ____) | | |____  | | \\ \\      \\  /     _| |_ / ____ \\  
 |_____/  |______| |_|  \\_\\      \\/     |_____/_/    \\_\\ 
{/cyan-fg}{/bold}{/center}

{center}ANÁLISIS INTELIGENTE DE OTs{/center}
{center}{gray-fg}Powered by DeepSeek AI{/gray-fg}{/center}

{center}───────────────────────────────────────────────{/center}

  {bold}FUNCIONALIDADES:{/bold}
  
  ✓ Importación masiva de CSV
  ✓ Filtrado inteligente (AGUA SERVIDA)
  ✓ Detección de código de partida
  ✓ Visualización detallada pre-análisis

{center}───────────────────────────────────────────────{/center}

{center}Presiona {yellow-fg}C{/yellow-fg} para cargar archivos{/center}
`;
  }

  private async cargarCSV(): Promise<void> {
    this.clear();
    const loading = this.crearLoading("Abriendo selector de archivos...");
    this.screen.append(loading);
    this.screen.render();

    const paths = await this.seleccionarArchivos();

    if (paths.length === 0) {
      await this.mostrarMensaje("No se seleccionó ningún archivo", "warning");
      this.mostrarInicio();
      return;
    }

    loading.setContent(`{center}Leyendo ${paths.length} archivo(s)...{/center}`);
    this.screen.render();

    if (!this.service) {
        // Nota: En producción, mejor leer de ENV o Config, pero mantenemos el input
        const apiKey = await this.pedirApiKey();
        if (!apiKey) {
            await this.mostrarError("API Key requerida para continuar");
            this.mostrarInicio();
            return;
        }
        this.service = new ServiaService(apiKey);
    }

    const result = await this.service.cargarCSVs(paths);

    if (!result.success) {
      await this.mostrarError(result.error);
      this.mostrarInicio();
      return;
    }

    this.records = result.data;

    if (this.records.length === 0) {
      await this.mostrarMensaje("No se encontraron registros de AGUA SERVIDA", "warning");
      this.mostrarInicio();
      return;
    }

    await this.mostrarMensaje(`✓ Cargados ${this.records.length} registros válidos`, "success");
    this.mostrarDatosMasterDetail(); // Nueva vista
  }

  /**
   * Nueva vista Master-Detail para ver datos antes de analizar
   */
  private mostrarDatosMasterDetail(): void {
    this.clear();

    // Header
    const header = this.crearHeader(` Vista Previa: ${this.records.length} OTs `);
    
    // Contenedor principal
    const container = blessed.box({
        top: 3,
        bottom: 3,
        width: "100%",
    });

    // Panel Izquierdo (Lista)
    const list = blessed.list({
      parent: container,
      left: 0,
      width: "30%", // 30% para la lista
      height: "100%",
      border: { type: "line" },
      label: " {bold}Lista de Tareas{/bold} ",
      style: { 
        border: { fg: "cyan" }, 
        selected: { bg: "blue", fg: "white", bold: true },
        item: { fg: "white" }
      },
      keys: true,
      mouse: true,
      vi: true,
      items: this.records.map(r => `${r.numTarea}`), // Solo mostramos el ID para limpiar
      scrollbar: { ch: " ", style: { bg: "cyan" } } // Barra de scroll visual
    });

    // Panel Derecho (Detalle)
    const detailBox = blessed.box({
      parent: container,
      right: 0,
      width: "70%", // 70% para el detalle
      height: "100%",
      border: { type: "line" },
      label: " {bold}Detalle de la OT{/bold} ",
      tags: true,
      style: { border: { fg: "yellow" } },
      padding: 1,
    });

    // Footer
    const footer = this.crearFooter(["[A] Analizar Todo"]);

    // Función para actualizar el detalle
    const updateDetail = () => {
        const index = list.selected!;
        const record = this.records[index];
        
        if (record) {
            const content = `
{bold}{cyan-fg}NÚMERO DE TAREA:{/cyan-fg}{/bold} 
${record.numTarea}

{bold}{cyan-fg}CATEGORÍA:{/cyan-fg}{/bold}
${record.categoriaOt}

{center}─────────────────────────────────────{/center}

{bold}{cyan-fg}NOTA / OBSERVACIÓN:{/cyan-fg}{/bold}

${record.nota}
            `;
            detailBox.setContent(content);
            this.screen.render();
        }
    };

    // Eventos
    list.on('select item', updateDetail); // Al mover con flechas
    list.on('select', updateDetail); // Al hacer click/enter (opcional, select item cubre movimiento)
    
    // Inicializar detalle
    updateDetail();

    this.screen.append(header);
    this.screen.append(container);
    this.screen.append(footer);

    list.focus();
    
    // Keybinds
    this.screen.key(["a", "A"], () => this.analizar());
    
    this.screen.render();
  }

  private async analizar(): Promise<void> {
    if (!this.service) return;
    this.clear();

    const progressBox = blessed.box({
      top: "center",
      left: "center",
      width: 60,
      height: 10,
      label: " Análisis IA en Progreso ",
      border: { type: "line" },
      style: { border: { fg: this.theme.primary } },
      tags: true,
    });

    const progressBar = blessed.progressbar({
      parent: progressBox,
      top: 2,
      left: 2,
      right: 2,
      height: 1,
      style: { bar: { bg: this.theme.success }, bg: "gray" },
      filled: 0,
    });

    const statusText = blessed.text({
      parent: progressBox,
      top: 4,
      left: "center",
      content: "Inicializando...",
      tags: true,
    });
    
    const detailsText = blessed.text({
        parent: progressBox,
        top: 6,
        left: "center",
        content: "{gray-fg}Conectando con DeepSeek...{/gray-fg}",
        tags: true
    });

    this.screen.append(progressBox);
    this.screen.render();

    const result = await this.service.procesarOTs(
      this.records,
      (current, total) => {
        const pct = (current / total) * 100;
        progressBar.setProgress(pct);
        statusText.setContent(`Procesando: ${current} / ${total}`);
        detailsText.setContent(`{gray-fg}Analizando OT: ${this.records[current-1]?.numTarea || '...'}{/gray-fg}`);
        this.screen.render();
      }
    );

    this.resultados = result.success;

    await this.mostrarMensaje(`✓ Análisis completado. Exitosos: ${result.stats.successful}`, "success");
    this.mostrarResultadosMasterDetail();
  }

  private mostrarResultadosMasterDetail(): void {
    this.clear();

    const total = this.resultados.length;
    const conPartidas = this.resultados.filter(r => r.partidasDetectadas.length > 0).length;

    // Header con resumen
    const header = blessed.box({
        top: 0,
        width: "100%",
        height: 3,
        content: `{center}Resultados: {bold}${total}{/bold} | Con Partidas: {green-fg}{bold}${conPartidas}{/bold}{/green-fg} | Sin Partidas: {red-fg}${total - conPartidas}{/red-fg}{/center}`,
        tags: true,
        style: { bg: this.theme.bgHeader, fg: "white" },
        border: {type: 'line'}
    });

    const container = blessed.box({
        top: 3,
        bottom: 3,
        width: "100%"
    });

    // Lista de resultados (con indicador visual de estado)
    const list = blessed.list({
      parent: container,
      left: 0,
      width: "35%",
      height: "100%",
      border: { type: "line" },
      label: " {bold}Resultados{/bold} ",
      tags: true,
      keys: true,
      mouse: true,
      vi: true,
      style: { 
          selected: { bg: "blue" },
          border: { fg: "green" }
      },
      items: this.resultados.map(r => {
          const icon = r.partidasDetectadas.length > 0 ? "{green-fg}✓{/green-fg}" : "{red-fg}✗{/red-fg}";
          return `${icon} ${r.numTarea}`;
      })
    });

    // Detalle del resultado
    const detailBox = blessed.box({
        parent: container,
        right: 0,
        width: "65%",
        height: "100%",
        border: { type: "line" },
        label: " {bold}Análisis IA{/bold} ",
        tags: true,
        padding: 1,
        style: { border: { fg: "cyan" } }
    });

    const updateDetail = () => {
        const index = list.selected;
        const res = this.resultados[index];
        // Buscar la nota original
        const original = this.records.find(r => r.numTarea === res.numTarea);

        if (res) {
            const partidasStr = res.partidasDetectadas.length > 0
                ? res.partidasDetectadas.map(p => `• {bold}${p.codigo}{/bold}: ${p.descripcion} ({green-fg}${(p.confianza*100).toFixed(0)}%{/green-fg})`).join('\n')
                : "{red-fg}No se detectaron partidas.{/red-fg}";

            const confianzaGlobal = (res.confianza * 100).toFixed(1);
            let colorConf = "red";
            if(res.confianza > 0.8) colorConf = "green";
            else if (res.confianza > 0.5) colorConf = "yellow";

            const content = `
{bold}OT:{/bold} ${res.numTarea}
{bold}Confianza Global:{/bold} {${colorConf}-fg}${confianzaGlobal}%{/${colorConf}-fg}

{bold}{underline}Partidas Detectadas:{/underline}{/bold}

${partidasStr}

{center}─────────────────────────────────────{/center}

{bold}Nota Original:{/bold}
${original?.nota || "N/A"}
            `;
            detailBox.setContent(content);
            this.screen.render();
        }
    };

    list.on('select item', updateDetail);
    list.on('select', updateDetail);
    updateDetail();

    const footer = this.crearFooter(["[H] Exportar HTML", "[S] Exportar CSV"]);

    this.screen.append(header);
    this.screen.append(container);
    this.screen.append(footer);

    list.focus();

    this.screen.key(["h", "H"], () => this.exportarHTML());
    this.screen.key(["s", "S"], () => this.exportarCSV());
    this.screen.render();
  }

  // ... (Resto de métodos auxiliares: exportar, loading, selector de archivos, inputs se mantienen con estilo mejorado si se desea) ...

  // Helper para Inputs (API Key, etc) con estilo consistente
  private async pedirApiKey(): Promise<string> {
    return new Promise((resolve) => {
      const form = blessed.form({
        top: "center",
        left: "center",
        width: 60,
        height: 8,
        label: " Configuración ",
        border: { type: "bg" },
        style: { border: { fg: "yellow" } },
      });

      blessed.text({
        parent: form,
        top: 1,
        left: 2,
        content: "Ingrese su API Key de DeepSeek:",
      });

      const textbox = blessed.textbox({
        parent: form,
        top: 3,
        left: 2,
        right: 2,
        height: 1,
        style: { bg: "blue", fg: "white" },
        inputOnFocus: true,
        censor: true,
      });

      this.screen.append(form);
      textbox.focus();
      this.screen.render();

      textbox.on("submit", (value) => {
        form.destroy();
        resolve(value.trim());
      });
      
      textbox.key('escape', () => {
          form.destroy();
          resolve("");
      });
    });
  }
  
  // Reutilización de lógica existente para selectores y loading
  private crearLoading(msg: string) {
      return blessed.box({
          top: 'center', left: 'center', width: 50, height: 5,
          content: `{center}${msg}{/center}`,
          tags: true, border: {type: 'line'}, style: {border: {fg: 'cyan'}}
      });
  }
  
  private async seleccionarArchivos(): Promise<string[]> {
    try {
      const cmd = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $ofd = New-Object System.Windows.Forms.OpenFileDialog; $ofd.Filter = 'CSV Files (*.csv)|*.csv'; $ofd.Multiselect = $true; if ($ofd.ShowDialog() -eq 'OK') { $ofd.FileNames | ForEach-Object { Write-Output $_ } }"`;
      const result = execSync(cmd, { encoding: "utf-8" }).trim();
      if (!result) return [];
      return result.split('\n').map(p => p.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  private async mostrarMensaje(msg: string, type: 'success' | 'warning' | 'error'): Promise<void> {
     const colors = { success: 'green', warning: 'yellow', error: 'red' };
     const box = blessed.box({
         top: 'center', left: 'center', width: 60, height: 7,
         content: `{center}{${colors[type]}-fg}${msg}{/${colors[type]}-fg}{/center}\n\n{center}Presiona Enter{/center}`,
         tags: true,
         border: { type: "line" },
         style: { border: { fg: colors[type] } }
     });
     this.screen.append(box);
     box.focus();
     this.screen.render();
     return new Promise(r => {
         box.key(['enter', 'escape', 'space'], () => { box.destroy(); r(); });
     });
  }

  private async mostrarError(msg: string) { return this.mostrarMensaje(msg, 'error'); }

  private mostrarMensajeTemporal(msg: string, type: 'success' | 'error') {
      const colors = { success: 'green', error: 'red' };
      const box = blessed.box({
          top: 3, right: 1, width: 40, height: 5,
          content: `{center}${msg}{/center}`,
          tags: true, border: {type: 'line'},
          style: { border: {fg: colors[type]} }
      });
      this.screen.append(box);
      this.screen.render();
      setTimeout(() => { box.destroy(); this.screen.render(); }, 2000);
  }

  private exportarHTML(): void {
      if (!this.service) return;
      const filename = ServiaService.generarNombreArchivo("html");
      const result = this.service.abrirHTML(this.resultados, filename);
      if (result.success) this.mostrarMensajeTemporal(`HTML Generado: ${filename}`, 'success');
  }

  private exportarCSV(): void {
      if (!this.service) return;
      const filename = ServiaService.generarNombreArchivo("csv");
      const result = this.service.exportarCSV(this.resultados, filename);
      if (result.success) this.mostrarMensajeTemporal(`CSV Guardado: ${filename}`, 'success');
  }
}