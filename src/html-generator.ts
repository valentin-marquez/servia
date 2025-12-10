import { AnalisisIA } from "./types";

export class HTMLGenerator {
  static generar(resultados: AnalisisIA[]): string {
    const stats = this.calcStats(resultados);
    const dateStr = new Date().toLocaleString("es-CL");

    return `<!DOCTYPE html>
<html lang="es" class="antialiased bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Servia AI - ${dateStr}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
              brand: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 900: '#0c4a6e' }
            }
          }
        }
      }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="text-slate-800 min-h-screen p-6 md:p-10">
    <div class="max-w-7xl mx-auto space-y-8">
        
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">📊 Análisis de OTs - Agua Servida</h1>
                <p class="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                    <span>Generado el ${dateStr}</span>
                    <span class="w-1 h-1 bg-slate-400 rounded-full"></span>
                    <span class="text-brand-600 font-medium">Powered by DeepSeek AI</span>
                </p>
            </div>
            <div class="flex gap-3">
                <button onclick="copiarTabla()" class="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-brand-500 focus:outline-none">
                    📋 Copiar
                </button>
                <button onclick="exportarCSV()" class="inline-flex items-center px-4 py-2 bg-brand-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-brand-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:outline-none">
                    📥 Descargar CSV
                </button>
            </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
                <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Procesadas</p>
                <p class="mt-2 text-3xl font-bold text-slate-900">${stats.total}</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 relative overflow-hidden">
                <div class="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
                <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Con Partidas</p>
                <div class="mt-2 flex items-baseline gap-2">
                    <p class="text-3xl font-bold text-green-600">${stats.conPartidas}</p>
                    <span class="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">${stats.conPartidasPct}%</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 relative overflow-hidden">
                <div class="absolute right-0 top-0 h-full w-1 bg-amber-400"></div>
                <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Sin Partidas</p>
                <div class="mt-2 flex items-baseline gap-2">
                    <p class="text-3xl font-bold text-amber-600">${stats.sinPartidas}</p>
                    <span class="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">${stats.sinPartidasPct}%</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
                <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Confianza Promedio</p>
                <p class="mt-2 text-3xl font-bold text-brand-600">${stats.avgConfianza}%</p>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
                <div class="relative flex-1 max-w-md">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input type="text" id="searchInput" oninput="filterTable()" placeholder="Buscar por Nº Tarea, Nota..." 
                        class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm transition-shadow">
                </div>
                <select id="filterSelect" onchange="filterTable()" 
                    class="block pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg border bg-white shadow-sm">
                    <option value="all">Todos los registros</option>
                    <option value="with">✅ Con partidas detectadas</option>
                    <option value="without">⚠️ Sin partidas</option>
                    <option value="high">🔥 Alta confianza (≥80%)</option>
                    <option value="low">📉 Baja confianza (<50%)</option>
                </select>
            </div>

            <div class="overflow-x-auto">
                <table id="resultsTable" class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Nº Tarea</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Partidas Detectadas</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción Principal</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Conf.</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody" class="bg-white divide-y divide-slate-200">
                        ${this.generarFilas(resultados)}
                    </tbody>
                </table>
            </div>
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 text-sm text-slate-500 flex justify-between">
                 <span>Mostrando ${resultados.length} registros</span>
            </div>
        </div>

        <footer class="text-center text-slate-400 text-sm py-8">
            <p>&copy; ${new Date().getFullYear()} Servia - Sistema de Clasificación Inteligente</p>
        </footer>
    </div>

    <div id="toast" class="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-50 flex items-center gap-2">
        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span id="toastMsg">Acción completada</span>
    </div>

    <script>
        const allRows = Array.from(document.querySelectorAll('#tableBody tr'));
        
        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }

        function filterTable() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const filter = document.getElementById('filterSelect').value;
            
            allRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                const partidasText = row.cells[2].textContent;
                const confianza = parseFloat(row.cells[4].dataset.value || 0);
                
                const matchSearch = textContent.includes(search);
                let matchFilter = true;
                
                if (filter === 'with') matchFilter = !partidasText.includes('Sin partidas');
                else if (filter === 'without') matchFilter = partidasText.includes('Sin partidas');
                else if (filter === 'high') matchFilter = confianza >= 80;
                else if (filter === 'low') matchFilter = confianza < 50;
                
                row.style.display = matchSearch && matchFilter ? '' : 'none';
            });
        }

        function copiarTabla() {
            const table = document.getElementById('resultsTable');
            const range = document.createRange();
            range.selectNode(table);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            showToast('Tabla copiada al portapapeles');
        }

        function exportarCSV() {
            const rows = [['Tarea', 'Partidas', 'Descripción Principal', 'Confianza']];
            allRows.forEach(row => {
                if (row.style.display !== 'none') {
                    rows.push([
                        row.cells[1].innerText,
                        row.cells[2].innerText,
                        row.cells[3].innerText,
                        row.cells[4].innerText
                    ]);
                }
            });
            const csv = rows.map(r => r.join(';')).join('\\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'analisis_servia_' + new Date().toISOString().slice(0,10) + '.csv';
            a.click();
            showToast('CSV descargado correctamente');
        }
    </script>
</body>
</html>`;
  }

  private static generarFilas(resultados: AnalisisIA[]): string {
    return resultados
      .map((r, idx) => {
        const partidaMasConfiable = r.partidasDetectadas.reduce(
          (max, p) => (p.confianza > max.confianza ? p : max),
          r.partidasDetectadas[0] || { confianza: 0 }
        );
        const descripcionPrincipal = partidaMasConfiable?.descripcion || "-";

        const partidasHTML =
          r.partidasDetectadas.length > 0
            ? r.partidasDetectadas
                .map((p) => {
                  let colorClass = "bg-red-100 text-red-800 border-red-200";
                  if (p.confianza >= 0.8) colorClass = "bg-green-100 text-green-800 border-green-200";
                  else if (p.confianza >= 0.5) colorClass = "bg-blue-100 text-blue-800 border-blue-200";

                  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} mr-2 mb-1">
                            ${p.codigo} <span class="ml-1 opacity-75 text-[10px]">(${(p.confianza * 100).toFixed(0)}%)</span>
                          </span>`;
                })
                .join("")
            : '<span class="text-slate-400 italic text-sm">Sin partidas</span>';

        const conf = (r.confianza || 0) * 100;
        let confBadge = `bg-red-50 text-red-700 ring-red-600/20`;
        if (conf >= 80) confBadge = `bg-green-50 text-green-700 ring-green-600/20`;
        else if (conf >= 50) confBadge = `bg-yellow-50 text-yellow-700 ring-yellow-600/20`;

        return `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${idx + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900 select-all">${r.numTarea}</td>
            <td class="px-6 py-4 text-sm text-slate-700">${partidasHTML}</td>
            <td class="px-6 py-4 text-sm text-slate-600 max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all" title="${descripcionPrincipal}">${descripcionPrincipal}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" data-value="${conf}">
                <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${confBadge}">
                    ${conf.toFixed(1)}%
                </span>
            </td>
        </tr>`;
      })
      .join("");
  }

  private static calcStats(resultados: AnalisisIA[]) {
    const total = resultados.length;
    const conPartidas = resultados.filter((r) => r.partidasDetectadas.length > 0).length;
    const sinPartidas = total - conPartidas;
    const avgConfianza = total > 0
        ? ((resultados.reduce((s, r) => s + (r.confianza || 0), 0) / total) * 100).toFixed(1)
        : "0.0";
    return {
      total,
      conPartidas,
      sinPartidas,
      conPartidasPct: total ? ((conPartidas / total) * 100).toFixed(1) : "0",
      sinPartidasPct: total ? ((sinPartidas / total) * 100).toFixed(1) : "0",
      avgConfianza,
    };
  }
}