// --- CLASE 3: GestorTareas (Única Responsabilidad de la lógica de negocio) ---
import { Tarea, EditableFields } from "./Tarea";
import { 
    Estadisticas, 
    ESTADOS_VALIDOS, 
    DIFICULTADES_VALIDAS 
} from "./Constantes";

export class GestorTareas {
  // Atributo interno privado que contiene la colección de objetos Tarea
  private tareas: Tarea[];

  constructor(tareasIniciales: Tarea[]) {
    this.tareas = tareasIniciales;
  }

  // Métodos de Comportamiento (CRUD/Mutación)

  public agregarTarea(tarea: Tarea): void {
    this.tareas.push(tarea);
  }

  public eliminarTareaPorId(id: number): boolean {
    const tarea = this.tareas.find(t => t.getId() === id);
    if (tarea && !tarea.esEliminada()) {
      tarea.marcarComoEliminada(); // Llama al método del objeto Tarea
      return true;
    }
    return false;
  }

  public editarTarea(id: number, cambios: EditableFields): boolean {
    const tarea = this.tareas.find(t => t.getId() === id);
    if (tarea) {
      const fechaEdicion = new Date().toLocaleString();
      tarea.editar(cambios, fechaEdicion); // Llama al método del objeto Tarea
      return true;
    }
    return false;
  }

  // Métodos de Consulta y Lógica de Negocio

  public generarId(): number {
    const ids = this.tareas.map(t => t.getId());
    const maxId = ids.length === 0 ? 0 : Math.max.apply(null, ids);
    return maxId + 1;
  }

  public obtenerTareaPorId(id: number): Tarea | undefined {
    return this.tareas.find(t => t.getId() === id);
  }

  public obtenerTareasVisibles(): Tarea[] {
    return this.tareas.filter(t => !t.esEliminada());
  }

  public obtenerTodasTareas(): Tarea[] {
      return this.tareas;
  }
  
  public ordenarTareas(criterio: string): Tarea[] {
    const visibles = this.obtenerTareasVisibles();
    const copiaTareas = [...visibles];

    copiaTareas.sort((a, b) => {
      let comparacion = 0;
      switch (criterio.toLowerCase()) {
        case "titulo":
          comparacion = a.getTitulo().localeCompare(b.getTitulo());
          break;
        case "vencimiento":
          const fechaA = new Date(a.getFechaVencimiento()).getTime();
          const fechaB = new Date(b.getFechaVencimiento()).getTime();
          comparacion = fechaA - fechaB;
          break;
        case "dificultad":
        // Lógica de ordenamiento para dificultad
          const ordenDificultad: { [key: string]: number } = {
            'fácil': 1,
            'medio': 2,
            'difícil': 3,
          };
          const dificultadA = ordenDificultad[a.getDificultad().toLowerCase()] || 4;
          const dificultadB = ordenDificultad[b.getDificultad().toLowerCase()] || 4;
          comparacion = dificultadA - dificultadB;
          break;
        case "creacion":
          const creacionA = new Date(a.getFechaCreacion()).getTime();
          const creacionB = new Date(b.getFechaCreacion()).getTime();
          comparacion = creacionA - creacionB;
          break;
      }
      return comparacion;
    });

    return copiaTareas;
  }
  
  public obtenerEstadisticas(): Estadisticas {
      const visibles = this.obtenerTareasVisibles(); 
      const total = visibles.length;
      
      const estadosBase: { [key: string]: { cantidad: number; porcentaje: string } } = {};
      ESTADOS_VALIDOS.forEach(estado => estadosBase[estado] = { cantidad: 0, porcentaje: "0.00%" });
      
      const dificultadesBase: { [key: string]: { cantidad: number; porcentaje: string } } = {};
      DIFICULTADES_VALIDAS.forEach(dificultad => dificultadesBase[dificultad] = { cantidad: 0, porcentaje: "0.00%" });

      function calcularPorcentaje(count: number, total: number): string {
          if (total === 0) return "0.00%";
          return ((count / total) * 100).toFixed(2) + "%";
      }
      
      visibles.forEach(tarea => {
          const estadoKey = tarea.getEstado().charAt(0).toUpperCase() + tarea.getEstado().slice(1);
          if (estadosBase.hasOwnProperty(estadoKey)) {
            estadosBase[estadoKey].cantidad++;
          }
          const dificultadKey = tarea.getDificultad().toLowerCase();
          if (dificultadesBase.hasOwnProperty(dificultadKey)) {
            dificultadesBase[dificultadKey].cantidad++;
          }
      });

      for (const estado in estadosBase) {
          estadosBase[estado].porcentaje = calcularPorcentaje(estadosBase[estado].cantidad, total);
      }
      for (const dificultad in dificultadesBase) {
          dificultadesBase[dificultad].porcentaje = calcularPorcentaje(dificultadesBase[dificultad].cantidad, total);
      }
      
      return {
          totalVisibles: total,
          porEstado: estadosBase,
          porDificultad: dificultadesBase
      };
  }

  public filtrarPorEstado(estado: string): Tarea[] {
  const visibles = this.obtenerTareasVisibles();
  // Filtra las tareas visibles por el estado solicitado, ignorando mayúsculas/minúsculas.
  return visibles.filter(t => t.getEstado().toLowerCase() === estado.toLowerCase());
}
}