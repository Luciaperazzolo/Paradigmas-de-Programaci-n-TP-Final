// Importamos la librería para pedirle datos al usuario en la consola.
import promptSync from "prompt-sync";
// Importamos la librería 'fs' (File System) de Node.js para para guardar y leer nuestras tareas.
import * as fs from "fs";
// Creamos una función 'prompt' a partir de 'promptSync' para usarla fácilmente.
const prompt = promptSync();

// Aca se guardan las tareas: "tareas.json".
const RUTA_ARCHIVO = "tareas.json";

// Las tareas van a ser asi:
interface Tarea {

  id: number;  // Número único para identificar la tarea.
  titulo: string;  // El nombre corto de la tarea.
  descripcion: string;    // Una explicación más larga de lo que hay que hacer.
  estado: string; // El estado actual: 'Pendiente', 'En curso' o 'Terminada'.
  fechaCreacion: string; // Cuándo se creó la tarea.
  fechaVencimiento: string; // Cuándo debe estar lista (opcional).
  dificultad: string; // Qué tan difícil es ('fácil', 'medio', 'difícil').
  eliminado: boolean; // Usamos 'eliminado' para dejar de mostrar la tarea (soft delete).
}

// Aquí guardaremos todas las tareas.
let tareas: Tarea[] = [];

// Una variable para contar cuántas tareas hay en total.
let numTareas: number = 0;

// La variable que guarda la opción que el usuario elige en el menú principal.
let opcion: string = "";


// --- FUNCIONES PARA GUARDAR Y CARGAR DATOS (SON 'IMPURAS' porque tocan archivos) ----------------------------------------


// Esta función lee el archivo de tareas. Si existe, carga las tareas; si no, devuelve una lista vacía.
function leerTareasDesdeArchivo(ruta: string): Tarea[] {
  try {
    if (fs.existsSync(ruta)) { // Comprueba si el archivo existe.
      const contenido = fs.readFileSync(ruta, { encoding: "utf8" }); // Lee todo el contenido del archivo como texto.
      if (contenido.trim() === "") { // Si el archivo está vacío, devuelve un array vacío.
        return [];
      }
      // Convierte el texto JSON que leyó en una lista de objetos Tarea.
      return JSON.parse(contenido) as Tarea[];
    }
    // Si el archivo no existe, también devuelve una lista vacía.
    return [];
  } catch (error) {
    // Si algo sale mal al leer, muestra un error en la consola.
    console.log("Error leyendo archivo de tareas: " + (error as Error).message);
    return [];
  }
}

// Esta función guarda la lista actual de tareas en el archivo JSON, sobrescribiendo lo que había.
function guardarTareasEnArchivo(ruta: string, listaTareas: Tarea[]): void {
  try {
    const texto = JSON.stringify(listaTareas, null, 2); // Convierte la lista de tareas de JavaScript a un texto en formato JSON, con un formato legible (2 espacios).
    fs.writeFileSync(ruta, texto, { encoding: "utf8" }); // Escribe el texto JSON en el archivo.
  } catch (error) {
    console.log("Error escribiendo archivo de tareas: " + (error as Error).message);   // Si algo sale mal al escribir, muestra un error.
  }
}


// --- CONFIGURACIÓN INICIAL ---------------------------------------------------


// Intentamos cargar las tareas al inicio del programa.
const tareasIniciales = leerTareasDesdeArchivo(RUTA_ARCHIVO);
if (tareasIniciales.length > 0) {
  tareas = tareasIniciales; // Si encontramos tareas, actualizamos nuestra lista global y el contador.
  numTareas = tareas.length;
} else {
  guardarTareasEnArchivo(RUTA_ARCHIVO, tareas);  // Si no hay tareas, nos aseguramos de crear un archivo JSON vacío por si las guardamos más tarde.
}


// --- FUNCIONES LÓGICAS (SON 'PURAS' porque no cambian variables globales ni tocan archivos) ---

// Genera un ID nuevo y único para una tarea.
function generarId(listaTareas: Tarea[]): number {
  const ids = listaTareas.map(function (t) { // Creamos una lista solo con los IDs de las tareas que ya existen.
    return t.id;
  });
  const maxId = ids.length === 0 ? 0 : Math.max.apply(null, ids); // Buscamos el ID más grande. Si no hay tareas, el máximo es 0.
  return maxId + 1;  // El nuevo ID será el ID más grande encontrado más 1.
}

// Crea un nuevo objeto Tarea con todos los datos y lo devuelve.
function crearTareaPura(
  id: number,
  titulo: string,
  descripcion: string,
  estado: string,
  fechaCreacion: string,
  fechaVencimiento: string,
  dificultad: string
): Tarea {
  return {
    id: id,
    titulo: titulo,
    descripcion: descripcion,
    estado: estado,
    fechaCreacion: fechaCreacion,
    fechaVencimiento: fechaVencimiento,
    dificultad: dificultad,
    eliminado: false, // Por defecto, una tarea nueva no está eliminada.
  };
}

// "Elimina" una tarea marcando su campo 'eliminado' como 'true'. Devuelve una *nueva* lista de tareas.
function eliminarTareaPorId(listaTareas: Tarea[], idEliminar: number): Tarea[] {
  // Recorremos la lista y devolvemos una nueva lista modificada.
  return listaTareas.map(function (t) {
    // Si encontramos la tarea con el ID que queremos eliminar:
    if (t.id === idEliminar) {
      // Devolvemos un objeto Tarea nuevo, igual al viejo, pero con 'eliminado' en true.
      return {
        id: t.id,
        titulo: t.titulo,
        descripcion: t.descripcion,
        estado: t.estado,
        fechaCreacion: t.fechaCreacion,
        fechaVencimiento: t.fechaVencimiento,
        dificultad: t.dificultad,
        eliminado: true, // ¡Aquí está el cambio!
      };
    }
    // Si no es la tarea que buscamos, la devolvemos sin cambios.
    return t;
  });
}

// Filtra la lista y solo devuelve las tareas que NO están marcadas como eliminadas.
function obtenerTareasVisibles(listaTareas: Tarea[]): Tarea[] {
  return listaTareas.filter(function (t) { // Usamos 'filter' para quedarnos solo con las tareas donde 'eliminado' es falso.
    return !t.eliminado;
  });
}


// --- EL MENÚ PRINCIPAL DEL PROGRAMA (ES IMPURA, porque interactúa con el usuario) ---


// Este bucle 'do-while' se ejecuta hasta que el usuario elija Salir.
do {
  // Limpia la pantalla de la consola para mostrar el menú limpio.
  console.clear();
  console.log("Bienvenido!\n");
  console.log("¿Qué deseas hacer?");
  console.log("1.Ver mis tareas");
  console.log("2.Buscar tarea");
  console.log("3.Agregar tarea");
  console.log("4.Ver Detalles de Tareas");
  console.log("5.Salir");
  console.log("6.Eliminar tarea\n");

  // Pide al usuario que elija una opción.
  opcion = prompt("Elige una opción: ") || "";

  // Usa un 'switch' para ejecutar la función o código correspondiente a la opción elegida.
  switch (opcion) {
    case "1":
      verTareas(); // Opción para ver las tareas (llama a la función 'verTareas').
      break;

    case "2":
      buscarTarea(); // Opción para buscar una tarea (llama a la función 'buscarTarea').
      break;

    case "3": // Opción para añadir una nueva tarea.
      if (numTareas < 10) {  // Primero, comprueba que no tengamos más de 10 tareas (el límite).

        // Le pedimos al usuario todos los datos de la nueva tarea.
        let titulo = prompt("Ingresa el título: ") || "";
        let descripcion = prompt("Ingresa la descripción: ") || "";
        let estado = prompt("Ingresa el estado (En curso, Pendiente, Terminada): ") || "";
        let vencimiento = prompt("Ingresa la fecha de vencimiento (opcional): ") || "";
        let dificultad = prompt("Ingresa la dificultad (fácil, medio, difícil): ") || "";

        const nuevoId = generarId(tareas); // Usamos la función pura para obtener el siguiente ID único.
        const fechaCreacion = new Date().toLocaleString(); // Obtenemos la fecha y hora actual para la creación.
        const nuevaTarea = crearTareaPura( // Usamos la función pura 'crearTareaPura' para armar el objeto Tarea.
          nuevoId,
          titulo,
          descripcion,
          estado,
          fechaCreacion,
          vencimiento,
          dificultad
        );

        tareas = tareas.concat(nuevaTarea); // Agregamos la nueva tarea a la lista existente (concatenando para no mutar el array original).

        numTareas = tareas.length;  // Actualizamos el contador de tareas.

        guardarTareasEnArchivo(RUTA_ARCHIVO, tareas);  // Guardamos los cambios en el archivo para que no se pierdan

        console.log("\n¡Tarea agregada con éxito!");
      } else {
        console.log("\n¡No se pueden agregar más tareas! El espacio está lleno.");  // Mensaje si se alcanza el límite de tareas.
      }
      prompt("Presiona Enter para continuar...");   // Esperamos que el usuario presione Enter para continuar.
      break;

    case "4":
      mostrarDetalles();   // Opción para ver detalles (llama a la función 'mostrarDetalles').
      break; 

    case "5":
      console.log("Salir");  // Opción para salir del bucle 'do-while'.
      break;

    case "6":
      // Opción para "borrar" una tarea (hacer soft delete).
      console.clear();
      console.log("--- Eliminar Tarea ---");
      let idStr = prompt("Ingresa el ID numérico de la tarea a eliminar: ") || "";  // Pedimos el ID de la tarea a eliminar.
      
      const idNum = parseInt(idStr);  // Convertimos el texto ingresado a un número.
      if (isNaN(idNum)) {
       
        console.log("ID inválido.");  // Comprobamos si el ID es un número válido.
      } else {
        const tareaEncontrada = tareas.find(function (t) { // Buscamos si existe alguna tarea con ese ID.
          return t.id === idNum;
        });
        if (!tareaEncontrada) {
          console.log("No existe ninguna tarea con ID " + idNum + "."); // Si no se encuentra, mostramos un mensaje.
        } else if (tareaEncontrada.eliminado) {
          console.log("La tarea con ID " + idNum + " ya está eliminada."); // Si ya estaba eliminada, también avisamos.
        } else {
          tareas = eliminarTareaPorId(tareas, idNum); // Si existe y no está eliminada: Usamos la función pura 'eliminarTareaPorId' para marcarla como eliminada.
          numTareas = tareas.length; // Actualizamos el contador
          guardarTareasEnArchivo(RUTA_ARCHIVO, tareas); // Guardamos el cambio en el archivo.

          console.log("Tarea con ID " + idNum + " marcada como eliminada.");
        }
      }
      prompt("\nPresiona Enter para continuar...");
      break;

    default:
      console.log("Opción no válida. Intenta de nuevo."); // Si el usuario pone una opción que no existe.
      prompt("Presiona Enter para continuar...");
      break;
  }
} while (opcion !== "5"); // El bucle se repite mientras la opción no sea "5".


// --- FUNCIONES PARA MOSTRAR LA INFORMACIÓN (SON IMPURAS porque usan 'console.log') ---------------


// Muestra las tareas según el estado que elija el usuario.
function verTareas(): void {
  console.clear();
  let subOpcion: string | undefined;
  console.log("¿Qué tarea deseas ver?");
  console.log("1.Todas");
  console.log("2.Pendientes");
  console.log("3.Terminadas");
  console.log("4.En Curso");
  console.log("5.Volver");

  subOpcion = prompt("Elige una opción: ") || "";// Pedimos la sub-opción.

  // Usamos la función pura para obtener solo las tareas que NO están eliminadas.
  const visibles = obtenerTareasVisibles(tareas);

  // Revisa la sub-opción elegida.
  switch (subOpcion) {
    case "1":
      console.clear();
      console.log("Todas tus tareas:");
      if (visibles.length === 0) {
        console.log("No tienes tareas agregadas.");
      } else {
        // Recorremos la lista de tareas visibles y mostramos todos sus detalles.
        visibles.forEach(function (tareaActual, indice) {
          console.log("\n--- Tarea " + (indice + 1) + " ---");
          console.log("ID: " + tareaActual.id);
          console.log("Título: " + tareaActual.titulo);
          console.log("Descripción: " + tareaActual.descripcion);
          console.log("Estado: " + tareaActual.estado);
          console.log("Dificultad: " + tareaActual.dificultad);
          console.log("Fecha de Creación: " + tareaActual.fechaCreacion);
          console.log("Fecha de Vencimiento: " + tareaActual.fechaVencimiento);
        });
      }
      break;

    case "2":
      console.clear();
      console.log("Tus tareas pendientes:");
      const pendientes = visibles.filter(function (t) { // Filtramos la lista visible para obtener solo las que están en estado "pendiente".
        return t.estado && t.estado.toLowerCase() === "pendiente";
      });
      if (pendientes.length === 0) {
        console.log("No tienes tareas pendientes.");
      } else {
        // Mostramos un resumen de las tareas pendientes.
        pendientes.forEach(function (tareaActual, indice) {
          console.log("\n--- Tarea " + (indice + 1) + " ---");
          console.log("ID: " + tareaActual.id);
          console.log("Título: " + tareaActual.titulo);
          console.log("Estado: " + tareaActual.estado);
        });
      }
      break;

    case "3":
      console.clear();
      console.log("Tareas terminadas:");
      // Filtramos la lista visible para obtener solo las que están en estado "terminada".
      const terminadas = visibles.filter(function (t) {
        return t.estado && t.estado.toLowerCase() === "terminada";
      });
      if (terminadas.length === 0) {
        console.log("No hay tareas terminadas.");
      } else {
        // Mostramos un resumen de las tareas terminadas.
        terminadas.forEach(function (tareaActual, indice) {
          console.log("\n--- Tarea " + (indice + 1) + " ---");
          console.log("ID: " + tareaActual.id);
          console.log("Título: " + tareaActual.titulo);
          console.log("Estado: " + tareaActual.estado);
        });
      }
      break;

    case "4":
      console.clear();
      console.log("Tus tareas en curso:");
      // Filtramos la lista visible para obtener solo las que están en estado "en curso".
      const enCurso = visibles.filter(function (t) {
        return t.estado && t.estado.toLowerCase() === "en curso";
      });
      if (enCurso.length === 0) {
        console.log("No tienes tareas en curso.");
      } else {
        // Mostramos un resumen de las tareas en curso.
        enCurso.forEach(function (tareaActual, indice) {
          console.log("\n--- Tarea " + (indice + 1) + " ---");
          console.log("ID: " + tareaActual.id);
          console.log("Título: " + tareaActual.titulo);
          console.log("Estado: " + tareaActual.estado);
        });
      }
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

// Muestra todos los detalles de las tareas que tienen un estado específico.
function mostrarDetalles(): void {
  console.clear();
  // Le pedimos al usuario el estado por el que quiere filtrar.
  let estadoBuscado = prompt("Ingresa el estado de la tarea que quieres ver (Pendiente, Terminada, En Curso): ") || "";
  let contador = 0;

  console.log("\nMostrando detalles de tareas: " + estadoBuscado);

  // Obtenemos las tareas que no están eliminadas.
  const visibles = obtenerTareasVisibles(tareas);
  // Filtramos las tareas visibles para que solo coincidan con el estado que buscó el usuario.
  const coincidentes = visibles.filter(function (t) {
    return t.estado && t.estado.toLowerCase() === estadoBuscado.toLowerCase();
  });

  // Recorremos y mostramos todos los detalles de cada tarea encontrada.
  coincidentes.forEach(function (tareaActual, indice) {
    console.log("\n--- Tarea " + (indice + 1) + " ---");
    console.log("ID: " + tareaActual.id);
    console.log("Título: " + tareaActual.titulo);
    console.log("Descripción: " + tareaActual.descripcion);
    console.log("Estado: " + tareaActual.estado);
    console.log("Dificultad: " + tareaActual.dificultad);
    console.log("Fecha de Creación: " + tareaActual.fechaCreacion);
    console.log("Fecha de Vencimiento: " + tareaActual.fechaVencimiento);
    contador++;
  });

  // Si el contador es cero, significa que no se encontró ninguna tarea.
  if (contador === 0) {
    console.log("No hay tareas con ese estado.");
  }

  prompt("\nPresiona Enter para continuar...");
}

// Busca tareas que contengan un texto específico en el título, descripción o estado.
function buscarTarea(): void {
  console.clear();
  console.log("--- Búsqueda de Tarea ---");

  // Pedimos al usuario la palabra o frase a buscar.
  let terminoBusqueda = prompt("Ingresa el título, descripción o estado de la tarea a buscar: ") || "";
  let terminoMinusc = terminoBusqueda.toLowerCase();  // Convertimos el término de búsqueda a minúsculas para que la búsqueda no distinga mayúsculas y minúsculas.

  // Obtenemos las tareas visibles.
  const visibles = obtenerTareasVisibles(tareas);
  const resultados = visibles.filter(function (t) { // Filtramos las tareas para encontrar aquellas que coinciden con el término de búsqueda en cualquiera de los campos.
    return (
      t.titulo.toLowerCase().includes(terminoMinusc) || // Comprobamos si el título incluye el término.
      t.descripcion.toLowerCase().includes(terminoMinusc) ||// Comprobamos si la descripción incluye el término.
      t.estado.toLowerCase().includes(terminoMinusc)  // Comprobamos si el estado incluye el término.
    );
  });

  if (resultados.length === 0) {
    // Si no encontramos nada.
    console.log("\nNo se encontraron tareas que coincidan con: " + terminoBusqueda);
  } else {
    // Si encontramos resultados, mostramos todos los detalles de las tareas.
    resultados.forEach(function (tareaActual, indice) {
      console.log("\n--- Coincidencia Encontrada (Tarea " + (indice + 1) + ") ---");
      console.log("ID: " + tareaActual.id);
      console.log("Título: " + tareaActual.titulo);
      console.log("Descripción: " + tareaActual.descripcion);
      console.log("Estado: " + tareaActual.estado);
      console.log("Dificultad: " + tareaActual.dificultad);
      console.log("Fecha de Creación: " + tareaActual.fechaCreacion);
      console.log("Fecha de Vencimiento: " + tareaActual.fechaVencimiento);
    });
  }

  prompt("\nPresiona Enter para continuar...");
}