// --- Tarea (Entidad de Datos) ---
export interface EditableFields {
    titulo?: string;
    descripcion?: string;
    estado?: string;
    fechaVencimiento?: string;
    dificultad?: string;
}

export class Tarea {
  // Atributos privados (Encapsulamiento)
  private id: number; 
  private titulo: string; 
  private descripcion: string;
  private estado: string; 
  private fechaCreacion: string; 
  private fechaVencimiento: string; 
  private dificultad: string; 
  private eliminado: boolean; 
  private ultimaEdicion: string; 

  constructor(
    id: number,
    titulo: string,
    descripcion: string,
    estado: string,
    fechaCreacion: string,
    fechaVencimiento: string,
    dificultad: string
  ) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.estado = estado;
    this.fechaCreacion = fechaCreacion;
    this.fechaVencimiento = fechaVencimiento;
    this.dificultad = dificultad;
    this.eliminado = false;
    this.ultimaEdicion = fechaCreacion;
  }

  // Métodos de exposición (Getters)
  public getId(): number { return this.id; }
  public getTitulo(): string { return this.titulo; }
  public getDescripcion(): string { return this.descripcion; }
  public getEstado(): string { return this.estado; }
  public getFechaCreacion(): string { return this.fechaCreacion; }
  public getFechaVencimiento(): string { return this.fechaVencimiento; }
  public getDificultad(): string { return this.dificultad; }
  public esEliminada(): boolean { return this.eliminado; }
  public getUltimaEdicion(): string { return this.ultimaEdicion; }

  // Método de acción (Comportamiento)
  public marcarComoEliminada(): void {
    this.eliminado = true;
  }

  // Método de acción (Comportamiento)
  public editar(cambios: EditableFields, fechaEdicion: string): void {
    if (cambios.titulo !== undefined) this.titulo = cambios.titulo;
    if (cambios.descripcion !== undefined) this.descripcion = cambios.descripcion;
    if (cambios.estado !== undefined) this.estado = cambios.estado;
    if (cambios.fechaVencimiento !== undefined) this.fechaVencimiento = cambios.fechaVencimiento;
    if (cambios.dificultad !== undefined) this.dificultad = cambios.dificultad;
    this.ultimaEdicion = fechaEdicion;
  }

  // Método para serializar a un formato que se pueda guardar (JSON)
  public toObjectForSave(): any {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      estado: this.estado,
      fechaCreacion: this.fechaCreacion,
      fechaVencimiento: this.fechaVencimiento,
      dificultad: this.dificultad,
      eliminado: this.eliminado,
      ultimaEdicion: this.ultimaEdicion,
    };
  }

  // Método estático para reconstruir la instancia a partir de datos cargados
  public static fromObject(data: any): Tarea {
    const tarea = new Tarea(
      data.id,
      data.titulo,
      data.descripcion,
      data.estado,
      data.fechaCreacion,
      data.fechaVencimiento,
      data.dificultad
    );
    // Restauramos el estado interno
    tarea.eliminado = data.eliminado;
    tarea.ultimaEdicion = data.ultimaEdicion;
    return tarea;
  }
}