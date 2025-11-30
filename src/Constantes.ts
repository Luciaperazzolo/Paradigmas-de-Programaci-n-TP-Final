/**
 * Definiciones de tipos y constantes que son compartidas.
 */

// Constantes de validación
export const ESTADOS_VALIDOS: string[] = ["Pendiente", "En curso", "Terminada"];
export const DIFICULTADES_VALIDAS: string[] = ["fácil", "medio", "difícil"];
export const RUTA_ARCHIVO = "tareas.json";

// Estructura para el resultado de las estadísticas
export interface Estadisticas {
  totalVisibles: number;
  porEstado: { [key: string]: { cantidad: number; porcentaje: string } };
  porDificultad: { [key: string]: { cantidad: number; porcentaje: string } };
}