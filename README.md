# Servia - Sistema de Análisis Inteligente de OTs

## 📁 Estructura del Proyecto

```
src/
├── types.ts                # Definiciones de tipos TypeScript
├── constants.ts            # Constantes y catálogo de partidas
├── prompt-builder.ts       # Constructor de prompts optimizado
├── csv-reader.ts           # Lector de archivos CSV
├── ai-client.ts            # Cliente de IA (DeepSeek)
├── html-generator.ts       # Generador de reportes HTML
├── exporter.ts             # Exportador de resultados
├── servia-service.ts       # Servicio principal (Facade)
├── ui-controller.ts        # Controlador de interfaz de usuario
└── main.ts                 # Punto de entrada
```

## 🏗️ Patrones de Diseño Implementados

### 1. **Facade Pattern** (`servia-service.ts`)
Simplifica la interacción con múltiples subsistemas:
- `CSVReader` para lectura de archivos
- `AIClient` para procesamiento con IA
- `Exporter` para exportación de resultados

### 2. **Builder Pattern** (`prompt-builder.ts`)
Construye prompts optimizados para la IA con mínimos tokens.

### 3. **Strategy Pattern** (implícito en `ai-client.ts`)
Diferentes estrategias de procesamiento:
- Detección rápida de tareas repetidas
- Análisis con IA para casos complejos
- Retry con backoff exponencial

### 4. **Controller Pattern** (`ui-controller.ts`)
Separa la lógica de UI de la lógica de negocio.

## 🚀 Características Principales

### Optimizaciones del Prompt
- **Tokens reducidos**: Catálogo compacto usando códigos
- **Reglas priorizadas**: Tarea repetida primero (3690)
- **Estructura JSON minimalista**: Solo campos esenciales
- **Temperatura baja (0.2)**: Mayor consistencia
- **Max tokens 800**: Respuestas concisas

### Detección de Tareas Repetidas
El sistema detecta automáticamente tareas repetidas/canceladas:
- "tarea repetida"
- "otro móvil"
- "copergo trabajando"
- "dirección incorrecta"

Asigna automáticamente código **3690** (PROBLEMA INEXISTENTE) con confianza 98%.

### Exportación HTML Mejorada
- **Tailwind CSS**: Diseño moderno y responsive
- **Filtros interactivos**: Búsqueda y filtrado en tiempo real
- **Copiar tabla**: Un clic para copiar al portapapeles
- **Descargar CSV**: Exportación directa desde el navegador
- **Top 10 partidas**: Visualización con barras de progreso
- **Estadísticas**: Cards con métricas clave

## 📊 Salida Esperada

### Formato de Salida Principal
```typescript
{
  numTarea: string,        // ID de la tarea
  partidasDetectadas: [    // Array de partidas
    {
      codigo: string,      // Código de partida
      descripcion: string, // Descripción
      confianza: number    // 0-1
    }
  ],
  confianza: number        // Promedio general
}
```

### HTML Interactivo
- **Vista general**: Estadísticas en cards
- **Top partidas**: Gráfico de barras
- **Tabla detallada**: Con filtros y búsqueda
- **Acciones**: Copiar tabla y descargar CSV

## 🎯 Flujo de Trabajo

1. **Carga de CSVs** → `CSVReader`
2. **Filtrado AGUA SERVIDA** → Automático
3. **Detección rápida** → Tareas repetidas
4. **Análisis IA** → DeepSeek API
5. **Exportación** → HTML/CSV

## 📝 Uso

```typescript
import { UIController } from "./ui-controller";

// Iniciar aplicación
new UIController();
```

### Flujo en Terminal
1. Presiona **[C]** para cargar CSVs
2. Ingresa API Key (primera vez)
3. Presiona **[A]** para analizar
4. Presiona **[H]** para abrir HTML
5. Presiona **[S]** para guardar CSV

## ⚙️ Configuración

### `constants.ts`
```typescript
export const AI_CONFIG = {
  MODEL: "deepseek-chat",
  TEMPERATURE: 0.2,      // Consistencia
  MAX_TOKENS: 800,       // Respuestas concisas
  BATCH_SIZE: 5,         // Concurrencia
  BATCH_DELAY: 1000,     // ms entre lotes
};
```

## 🔧 Ventajas de la Modularización

1. **Separation of Concerns**: Cada módulo tiene una responsabilidad única
2. **Testeable**: Módulos independientes fáciles de probar
3. **Mantenible**: Cambios localizados sin afectar otros módulos
4. **Reutilizable**: Componentes pueden usarse en otros proyectos
5. **Escalable**: Fácil agregar nuevas funcionalidades

## 📦 Dependencias

```json
{
  "openai": "^4.x",
  "blessed": "^0.1.x",
  "csv-parse": "^5.x",
  "csv-stringify": "^6.x"
}
```

## 🎨 HTML Features

- ✅ Tailwind CSS CDN (sin compilación)
- ✅ Responsive design
- ✅ Búsqueda en tiempo real
- ✅ Filtros múltiples
- ✅ Copiar al portapapeles
- ✅ Exportar CSV desde navegador
- ✅ Estadísticas visuales
- ✅ Top 10 partidas con gráficos

## 🚦 Estado del Proyecto

- ✅ Modularización completa
- ✅ Patrones de diseño implementados
- ✅ Prompt optimizado (<600 tokens)
- ✅ HTML con Tailwind
- ✅ Detección de tareas repetidas
- ✅ Exportación funcional