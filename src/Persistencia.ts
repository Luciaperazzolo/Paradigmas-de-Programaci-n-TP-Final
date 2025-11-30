// --- CLASE 2: Persistencia (Modularización, Única Responsabilidad de E/S) ---
import * as fs from "fs"; 
import { Tarea } from "./Tarea";
import { RUTA_ARCHIVO } from "./Constantes";

export class Persistencia {
  private ruta: string;

  constructor(ruta: string) {
    this.ruta = RUTA_ARCHIVO; //Usa la constante importada
  }

  /**
   * Carga tareas desde el archivo y las convierte a objetos Tarea.
   * @returns Lista de objetos Tarea.
   */
  public cargar(): Tarea[] {
    try {
      if (fs.existsSync(this.ruta)) {
        const contenido = fs.readFileSync(this.ruta, { encoding: "utf8" });
        if (contenido.trim() === "") return [];
        // Mapea los objetos JSON a instancias de la clase Tarea
        const data = JSON.parse(contenido) as any[];
        return data.map(Tarea.fromObject);
      }
      return [];
    } catch (error) {
      console.log("Error leyendo archivo de tareas: " + (error as Error).message + " ");
      return [];
    }
  }

  /**
   * Guarda las tareas serializando los objetos Tarea a JSON.
   * @param tareas La lista de Tarea a guardar.
   */
  public guardar(tareas: Tarea[]): void {
    try {
      // Mapea las instancias de Tarea a un formato JSON simple para guardar
      const dataToSave = tareas.map(t => t.toObjectForSave());
      const texto = JSON.stringify(dataToSave, null, 2);
      fs.writeFileSync(this.ruta, texto, { encoding: "utf8" });
    } catch (error) {
      console.log("Error escribiendo archivo de tareas: " + (error as Error).message + " ");
    }
  }
}