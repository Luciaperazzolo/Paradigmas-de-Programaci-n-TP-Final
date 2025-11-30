// Importamos librerías externas (Node.js)
import promptSync from "prompt-sync";
// Importamos las clases definidas en archivos separados (Modularización)
import { Tarea, EditableFields } from "./Tarea";
import { Persistencia } from "./Persistencia";
import { GestorTareas } from "./GestorTareas";
import { 
    ESTADOS_VALIDOS, 
    DIFICULTADES_VALIDAS, 
    RUTA_ARCHIVO 
} from "./Constantes";

const prompt = promptSync();

// --- CONFIGURACIÓN E INICIALIZACIÓN ---
//Inicializa la persistencia
const persistencia = new Persistencia(RUTA_ARCHIVO);
//Carga las tareas iniciales usando la persistencia
const tareasIniciales: Tarea[] = persistencia.cargar();
//Inicializa el gestor con las tareas cargadas
const gestor = new GestorTareas(tareasIniciales);
let opcion: string = "";

// --- FUNCIONES DE UTILIDAD (Helper Functions) ---

// Se mantienen aquí o se moverían a un archivo util.ts
function validarEntradaPura(entrada: string, listaValida: string[], mensajeError: string): string | null {
  if (listaValida.map(o => o.toLowerCase()).includes(entrada.toLowerCase())) {
    return listaValida.find(o => o.toLowerCase() === entrada.toLowerCase()) || entrada;
  }
  console.log(mensajeError);
  return null;
}

function obtenerDecoracionDificultad(dificultad: string): string {
  const key = dificultad ? dificultad.toLowerCase() : "";
  const mapa: { [key: string]: string } = {
    'fácil': '★☆☆',
    'facil': '★☆☆',
    'medio': '★★☆',
    'difícil': '★★★',
    'dificil': '★★★'
  };
  return mapa[key] || dificultad;
}


// --- FUNCIONES DE PRESENTACIÓN (Lógica de Interacción) ---
// Estas funciones usan los métodos del objeto 'gestor' y 'persistencia'.

function agregarTarea(): void {
  console.clear();
  if (gestor.obtenerTareasVisibles().length < 10) { 
    console.log("--- Agregar Nueva Tarea ---");
    
    let titulo = prompt("Ingresa el título: ") || "";
    let descripcion = prompt("Ingresa la descripción: ") || "";
    let estado: string | null = null;
    let dificultad: string | null = null;
    let vencimiento = prompt("Ingresa la fecha de vencimiento (opcional): ") || "";

    // Validación de Estado y Dificultad...
    while (estado === null) {
      const entradaEstado = prompt(`Ingresa el estado (${ESTADOS_VALIDOS.join(', ')}): `) || "";
      estado = validarEntradaPura(entradaEstado, ESTADOS_VALIDOS, "⚠️ Estado inválido. Intenta de nuevo.");
      if (entradaEstado === "" && estado === null) { estado = "Pendiente"; }
    }
    while (dificultad === null) {
      const entradaDificultad = prompt(`Ingresa la dificultad (${DIFICULTADES_VALIDAS.join(', ')}): `) || "";
      dificultad = validarEntradaPura(entradaDificultad, DIFICULTADES_VALIDAS, "⚠️ Dificultad inválida. Intenta de nuevo.");
      if (entradaDificultad === "" && dificultad === null) { dificultad = "fácil"; }
    }
    
    const nuevoId = gestor.generarId();
    const fechaCreacion = new Date().toLocaleString(); 

    // Crea el objeto Tarea (se instancia la clase importada)
    const nuevaTarea = new Tarea( 
      nuevoId,
      titulo,
      descripcion,
      estado,
      fechaCreacion,
      vencimiento,
      dificultad
    );

    gestor.agregarTarea(nuevaTarea); // Delega la acción al Gestor
    persistencia.guardar(gestor.obtenerTodasTareas()); // Delega el guardado a Persistencia

    console.log("\n✅ ¡Tarea agregada con éxito!");
  } else {
    console.log("\n⚠️ ¡No se pueden agregar más tareas! El espacio está lleno (Máx: 10).");
  }
  prompt("Presiona Enter para continuar...");
}

function manejarEliminacionTarea(): void {
  console.clear();
  console.log("--- Eliminar Tarea ---");
  let idStr = prompt("Ingresa el ID numérico de la tarea a eliminar: ") || "";
  
  const idNum = parseInt(idStr);
  if (isNaN(idNum)) {
    console.log("⚠️ ID inválido.");
  } else {
    const tareaEncontrada = gestor.obtenerTareaPorId(idNum);
    
    if (!tareaEncontrada) {
      console.log("❌ No existe ninguna tarea con ID " + idNum + " " + ".");
    } else if (tareaEncontrada.esEliminada()) {
      console.log("⚠️ La tarea con ID " + idNum + " " + " ya está eliminada.");
    } else {
      gestor.eliminarTareaPorId(idNum); // Delega la eliminación
      persistencia.guardar(gestor.obtenerTodasTareas()); // Guarda el estado

      console.log("✅ Tarea con ID " + idNum + " " + " marcada como eliminada.");
    }
  }
  prompt("\nPresiona Enter para continuar...");
}

function editarTarea(): void {
  console.clear();
  console.log("--- Editar Tarea ---");
  const idStr = prompt("Ingresa el ID numérico de la tarea a editar: ") || "";
  const idNum = parseInt(idStr);
  
  if (isNaN(idNum)) {
    console.log("⚠️ ID inválido.");
    prompt("Presiona Enter para continuar...");
    return;
  }

  const tareaEncontrada = gestor.obtenerTareaPorId(idNum);

  if (!tareaEncontrada) {
    console.log("❌ No existe ninguna tarea con ID " + idNum + " " + ".");
    prompt("Presiona Enter para continuar...");
    return;
  }

  // Pedimos nuevos valores (usando los getters de Tarea)
  const nuevoTitulo = prompt("Nuevo título (enter para mantener - actual: " + tareaEncontrada.getTitulo() + "): ") || "";
  const nuevaDescripcion = prompt("Nueva descripción (enter para mantener - actual: " + tareaEncontrada.getDescripcion() + "): ") || "";
  let nuevoEstado = prompt(`Nuevo estado (${ESTADOS_VALIDOS.join(', ')}) (enter para mantener - actual: ${tareaEncontrada.getEstado()}): `) || "";
  let nuevaDificultad = prompt(`Nueva dificultad (${DIFICULTADES_VALIDAS.join(', ')}) (enter para mantener - actual: ${tareaEncontrada.getDificultad()}): `) || "";
  const nuevoVencimiento = prompt("Nueva fecha de vencimiento (opcional) (enter para mantener - actual: " + tareaEncontrada.getFechaVencimiento() + "): ") || "";

  const cambios: EditableFields = {};
  if (nuevoTitulo !== "") cambios.titulo = nuevoTitulo;
  if (nuevaDescripcion !== "") cambios.descripcion = nuevaDescripcion;
  if (nuevoVencimiento !== "") cambios.fechaVencimiento = nuevoVencimiento;
  
  if (nuevoEstado !== "") {
    const estadoValidado = validarEntradaPura(nuevoEstado, ESTADOS_VALIDOS, "⚠️ Estado ingresado no es válido. Se mantendrá el valor actual.");
    if (estadoValidado) cambios.estado = estadoValidado;
  }
  
  if (nuevaDificultad !== "") {
    const dificultadValidada = validarEntradaPura(nuevaDificultad, DIFICULTADES_VALIDAS, "⚠️ Dificultad ingresada no es válida. Se mantendrá el valor actual.");
    if (dificultadValidada) cambios.dificultad = dificultadValidada;
  }

  if (Object.keys(cambios).length > 0) {
    gestor.editarTarea(idNum, cambios as EditableFields); // Delega la edición
      persistencia.guardar(gestor.obtenerTodasTareas());
      console.log("✅ Tarea con ID " + idNum + " " + " editada con éxito. Última Edición: " + tareaEncontrada.getUltimaEdicion() + " ");
  } else {
       console.log("ℹ️ No se detectaron cambios válidos para editar.");
  }

  prompt("Presiona Enter para continuar...");
}

function verTareas(): void {
  console.clear();
  let subOpcion: string | undefined;
  console.log("¿Qué tarea deseas ver?");
  console.log("1.Todas");
  console.log("2.Pendientes");
  console.log("3.Terminadas");
  console.log("4.En Curso");
  console.log("5.Volver");

  subOpcion = prompt("Elige una opción: ") || "";

  function mostrarResumenTareas(lista: Tarea[]): void {
      if (lista.length === 0) {
          console.log("No tienes tareas en este estado.");
      } else {
          // Si quieres que el resumen esté ordenado, llama a ordenarTareas aquí:
          // const ordenadas = gestor.ordenarTareas("creacion", lista); 
          lista.forEach(function (tareaActual, indice) {
              console.log(`\n--- Tarea ${indice + 1} ---`);
              console.log(`ID: ${tareaActual.getId()}`);
              console.log(`Título: ${tareaActual.getTitulo()}`);
              console.log(`Estado: ${tareaActual.getEstado()}`);
          });
      }
  }

  const visibles = gestor.obtenerTareasVisibles();

  switch (subOpcion) {
    case "1":
      console.clear();
      console.log("Todas tus tareas:");
      if (visibles.length === 0) {
        console.log("No tienes tareas agregadas.");
      } else {
        const ordenadas = gestor.ordenarTareas("creacion");
        ordenadas.forEach(function (tareaActual, indice) {
          console.log("\n--- Tarea " + (indice + 1) + " " + " ---");
          console.log("ID: " + tareaActual.getId() + " ");
          console.log("Título: " + tareaActual.getTitulo() + " ");
          console.log("Descripción: " + tareaActual.getDescripcion() + " ");
          console.log("Estado: " + tareaActual.getEstado() + " ");
          const decoracion = obtenerDecoracionDificultad(tareaActual.getDificultad());
          console.log("Dificultad: " + decoracion + " (" + tareaActual.getDificultad() + ") " );
          console.log("Fecha de Creación: " + tareaActual.getFechaCreacion() + " ");
          console.log("Fecha de Vencimiento: " + tareaActual.getFechaVencimiento() + " ");
          console.log("Última Edición: " + tareaActual.getUltimaEdicion() + " ");
        });
      }
      break;
    
      case "2": // Pendientes
      console.clear();
      console.log("Tus tareas Pendientes:");
      const pendientes = gestor.filtrarPorEstado("Pendiente"); // 🎯 Nuevo: Delegación al Gestor
      mostrarResumenTareas(pendientes);
      break;

      case "3": // Terminadas
      console.clear();
      console.log("Tus tareas Terminadas:");
      const terminadas = gestor.filtrarPorEstado("Terminada"); // 🎯 Nuevo: Delegación al Gestor
      mostrarResumenTareas(terminadas);
      break;

      case "4": // En Curso
      console.clear();
      console.log("Tus tareas En Curso:");
      const enCurso = gestor.filtrarPorEstado("En curso"); // 🎯 Nuevo: Delegación al Gestor
      mostrarResumenTareas(enCurso);
      break;
    
    case "5":
      console.log("Volviendo...");
      break;

    default:
      console.log("Opción no válida.");
      break;
  }

  prompt("\nPresiona Enter para continuar...");
}

function ordenarTareas(): void {
  console.clear();
  let opcionOrden: string = "";
  let criterio: string = "";

  console.log("--- Ordenar Tareas ---");
  console.log("¿Por qué atributo deseas ordenar?");
  console.log("1. Título");
  console.log("2. Fecha de Vencimiento");
  console.log("3. Fecha de Creación");
  console.log("4. Dificultad (fácil, medio, difícil)");
  console.log("5. Volver");
  opcionOrden = prompt("Elige una opción: ") || "";

  switch (opcionOrden) {
    case "1": criterio = "titulo"; break;
    case "2": criterio = "vencimiento"; break;
    case "3": criterio = "creacion"; break;
    case "4": criterio = "dificultad"; break;
    case "5":
      console.log("Volviendo al menú principal...");
      prompt("Presiona Enter para continuar...");
      return;
    default:
      console.log("Opción no válida.");
      prompt("Presiona Enter para continuar...");
      return;
  }

  // La ordenación es temporal para la vista
  const tareasOrdenadas = gestor.ordenarTareas(criterio);

  console.clear();
  console.log("\n✅ ¡Tareas ordenadas por " + criterio + " " + " con éxito!");
  
  if (tareasOrdenadas.length > 0) {
      tareasOrdenadas.forEach(function (tareaActual, indice) {
          console.log("\n--- Tarea " + (indice + 1) + " " + " ---");
          console.log("ID: " + tareaActual.getId() + " ");
          console.log("Título: " + tareaActual.getTitulo() + " ");
          console.log("Estado: " + tareaActual.getEstado() + " ");
      });
  }

  prompt("\nPresiona Enter para continuar...");
}

function mostrarEstadisticas(): void {
  console.clear();
  console.log("--- Resumen y Estadísticas de Tareas ---");

  const stats = gestor.obtenerEstadisticas();

  console.log("\n✅ Total de Tareas Visibles: " + stats.totalVisibles + " ");
  console.log("\n-------------------------------------------");
  console.log("📊 Distribución por Estado:");
  console.log("-------------------------------------------");
  for (const estado in stats.porEstado) {
    const data = stats.porEstado[estado];
    console.log("- " + estado + ": " + data.cantidad + " " + "tareas (" + data.porcentaje + ")");
  }
  
  console.log("\n-------------------------------------------");
  console.log(" Distribución por Dificultad:");
  console.log("-------------------------------------------");
  for (const dificultad in stats.porDificultad) {
    const data = stats.porDificultad[dificultad];
    console.log("- " + (dificultad.charAt(0).toUpperCase() + dificultad.slice(1)) + ": " + data.cantidad + " " + "tareas (" + data.porcentaje + ")");
  }

  prompt("\nPresiona Enter para continuar...");
}

// --- EL MENÚ PRINCIPAL DEL PROGRAMA (Capa de Presentación) ---

do {
  console.clear();
  console.log("Bienvenido!\n");
  console.log("¿Qué deseas hacer?");
  console.log("1.Ver mis tareas");
  console.log("2.Buscar tarea");
  console.log("3.Agregar tarea");
  console.log("4.Ver Detalles de Tareas");
  console.log("5.Salir");
  console.log("6.Eliminar tarea\n");
  console.log("7.Ordenar Tareas\n")
  console.log("8.Ver Estadísticas\n");
  console.log("9.Consultas/Inferencia\n");
  console.log("10.Editar tarea\n");

  opcion = prompt("Elige una opción: ") || "";

  switch (opcion) {
    case "1": verTareas(); break;
    case "2": console.log("Opción 2 requiere adaptación."); prompt("Presiona Enter para continuar..."); break; 
    case "3": agregarTarea(); break;
    case "4": console.log("Opción 4 requiere adaptación."); prompt("Presiona Enter para continuar..."); break;
    case "5": console.log("¡Adiós! Tareas guardadas en " + RUTA_ARCHIVO + "."); break;
    case "6": manejarEliminacionTarea(); break;
    case "7": ordenarTareas(); break;
    case "8": mostrarEstadisticas(); break;
    case "9": console.log("Opción 9 requiere adaptación."); prompt("Presiona Enter para continuar..."); break;
    case "10": editarTarea(); break;

    default:
      console.log("Opción no válida. Intenta de nuevo."); 
      prompt("Presiona Enter para continuar...");
      break;
  }
} while (opcion !== "5");