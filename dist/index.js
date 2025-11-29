"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const fs = __importStar(require("fs"));
const prompt = (0, prompt_sync_1.default)();
// Ruta del archivo donde se persistirán las tareas
const RUTA_ARCHIVO = "tareas.json";
// Uso de un arreglo dinámico para manejar más fácil las operaciones funcionales.
// (Mantengo el límite de 10 tareas al agregar.)
let tareas = [];
// manetengo contador para comprobar límite al agregar.
let numTareas = 0;
let opcion = "";
// ---------- FUNCIONES DE PERSISTENCIA (IMPURAS) ----------
// Lee el archivo de tareas si existe y devuelve el arreglo; si no existe, devuelve arreglo vacío.
function leerTareasDesdeArchivo(ruta) {
    try {
        if (fs.existsSync(ruta)) {
            const contenido = fs.readFileSync(ruta, { encoding: "utf8" });
            if (contenido.trim() === "") {
                return [];
            }
            return JSON.parse(contenido);
        }
        return [];
    }
    catch (error) {
        console.log("Error leyendo archivo de tareas: " + error.message);
        return [];
    }
}
// Guarda el arreglo de tareas en el archivo (sobrescribe).
function guardarTareasEnArchivo(ruta, listaTareas) {
    try {
        const texto = JSON.stringify(listaTareas, null, 2);
        fs.writeFileSync(ruta, texto, { encoding: "utf8" });
    }
    catch (error) {
        console.log("Error escribiendo archivo de tareas: " + error.message);
    }
}
// Al iniciar, intento cargar las tareas desde el archivo.
const tareasIniciales = leerTareasDesdeArchivo(RUTA_ARCHIVO);
if (tareasIniciales.length > 0) {
    tareas = tareasIniciales;
    numTareas = tareas.length;
}
else {
    // Si no existía archivo, me aseguro de crear uno vacío para persistencia futura.
    guardarTareasEnArchivo(RUTA_ARCHIVO, tareas);
}
// FUNCIONES PURAS 
// Función pura: dado el arreglo de tareas devuelve el siguiente id (max id + 1).
function generarId(listaTareas) {
    const ids = listaTareas.map(function (t) {
        return t.id;
    });
    const maxId = ids.length === 0 ? 0 : Math.max.apply(null, ids);
    return maxId + 1;
}
// Función pura: crea una tarea a partir de datos
function crearTareaPura(id, titulo, descripcion, estado, fechaCreacion, fechaVencimiento, dificultad) {
    return {
        id: id,
        titulo: titulo,
        descripcion: descripcion,
        estado: estado,
        fechaCreacion: fechaCreacion,
        fechaVencimiento: fechaVencimiento,
        dificultad: dificultad,
        eliminado: false,
    };
}
// Función pura: marca como eliminado (soft delete) la tarea con id dado.
// Devuelve un nuevo arreglo (no muta el original).
function eliminarTareaPorId(listaTareas, idEliminar) {
    return listaTareas.map(function (t) {
        if (t.id === idEliminar) {
            // devolvemos un nuevo objeto con 'eliminado' = true
            return {
                id: t.id,
                titulo: t.titulo,
                descripcion: t.descripcion,
                estado: t.estado,
                fechaCreacion: t.fechaCreacion,
                fechaVencimiento: t.fechaVencimiento,
                dificultad: t.dificultad,
                eliminado: true,
            };
        }
        return t;
    });
}
// Función pura: devuelve solo las tareas no eliminadas.
function obtenerTareasVisibles(listaTareas) {
    return listaTareas.filter(function (t) {
        return !t.eliminado;
    });
}
/* ---------- LÓGICA DE INTERFAZ (IMPURA) ---------- */
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
    opcion = prompt("Elige una opción: ") || "";
    switch (opcion) {
        case "1":
            verTareas();
            break;
        case "2":
            buscarTarea();
            break;
        case "3":
            if (numTareas < 10) {
                // Pedimos datos (I/O, entrada/salida) — esta parte es impura por definición.
                let titulo = prompt("Ingresa el título: ") || "";
                let descripcion = prompt("Ingresa la descripción: ") || "";
                let estado = prompt("Ingresa el estado (En curso, Pendiente, Terminada): ") || "";
                let vencimiento = prompt("Ingresa la fecha de vencimiento (opcional): ") || "";
                let dificultad = prompt("Ingresa la dificultad (fácil, medio, difícil): ") || "";
                // Generamos id con función pura.
                const nuevoId = generarId(tareas);
                // Creamos la fecha de creación (I/O, entrada/salida) y usamos la función pura para construir la tarea.
                const fechaCreacion = new Date().toLocaleString();
                const nuevaTarea = crearTareaPura(nuevoId, titulo, descripcion, estado, fechaCreacion, vencimiento, dificultad);
                // Agregamos la tarea al arreglo (operación impura sobre el estado global).
                tareas = tareas.concat(nuevaTarea);
                numTareas = tareas.length;
                // Persisto el cambio en el archivo.
                guardarTareasEnArchivo(RUTA_ARCHIVO, tareas);
                console.log("\n¡Tarea agregada con éxito!");
            }
            else {
                console.log("\n¡No se pueden agregar más tareas! El espacio está lleno.");
            }
            prompt("Presiona Enter para continuar...");
            break;
        case "4":
            mostrarDetalles();
            break;
        case "5":
            console.log("Salir");
            break;
        case "6":
            // Opción para eliminar (soft delete).
            console.clear();
            console.log("--- Eliminar Tarea ---");
            let idStr = prompt("Ingresa el ID numérico de la tarea a eliminar: ") || "";
            const idNum = parseInt(idStr);
            if (isNaN(idNum)) {
                console.log("ID inválido.");
            }
            else {
                const tareaEncontrada = tareas.find(function (t) {
                    return t.id === idNum;
                });
                if (!tareaEncontrada) {
                    console.log("No existe ninguna tarea con ID " + idNum + ".");
                }
                else if (tareaEncontrada.eliminado) {
                    console.log("La tarea con ID " + idNum + " ya está eliminada.");
                }
                else {
                    // Aplicamos la función pura para obtener un nuevo arreglo con la tarea marcada como eliminada.
                    tareas = eliminarTareaPorId(tareas, idNum);
                    numTareas = tareas.length;
                    // Persisto el cambio en el archivo.
                    guardarTareasEnArchivo(RUTA_ARCHIVO, tareas);
                    console.log("Tarea con ID " + idNum + " marcada como eliminada.");
                }
            }
            prompt("\nPresiona Enter para continuar...");
            break;
        default:
            console.log("Opción no válida. Intenta de nuevo.");
            prompt("Presiona Enter para continuar...");
            break;
    }
} while (opcion !== "5");
//FUNCIONES DE VISUALIZACIÓN (IMPURAS - solamente para mostrar en pantalla)
// --- FUNCIÓN VER TAREAS ---
function verTareas() {
    console.clear();
    let subOpcion;
    console.log("¿Qué tarea deseas ver?");
    console.log("1.Todas");
    console.log("2.Pendientes");
    console.log("3.Terminadas");
    console.log("4.En Curso");
    console.log("5.Volver");
    subOpcion = prompt("Elige una opción: ") || "";
    // Obtengo lista visible (no eliminadas) con función pura.
    const visibles = obtenerTareasVisibles(tareas);
    switch (subOpcion) {
        case "1":
            console.clear();
            console.log("Todas tus tareas:");
            if (visibles.length === 0) {
                console.log("No tienes tareas agregadas.");
            }
            else {
                // Imprimo cada tarea (forEach es efecto secundario controlado).
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
            const pendientes = visibles.filter(function (t) {
                return t.estado && t.estado.toLowerCase() === "pendiente";
            });
            if (pendientes.length === 0) {
                console.log("No tienes tareas pendientes.");
            }
            else {
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
            const terminadas = visibles.filter(function (t) {
                return t.estado && t.estado.toLowerCase() === "terminada";
            });
            if (terminadas.length === 0) {
                console.log("No hay tareas terminadas.");
            }
            else {
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
            const enCurso = visibles.filter(function (t) {
                return t.estado && t.estado.toLowerCase() === "en curso";
            });
            if (enCurso.length === 0) {
                console.log("No tienes tareas en curso.");
            }
            else {
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
// --- FUNCIÓN MOSTRAR DETALLES ---
function mostrarDetalles() {
    console.clear();
    let estadoBuscado = prompt("Ingresa el estado de la tarea que quieres ver (Pendiente, Terminada, En Curso): ") || "";
    let contador = 0;
    console.log("\nMostrando detalles de tareas: " + estadoBuscado);
    const visibles = obtenerTareasVisibles(tareas);
    const coincidentes = visibles.filter(function (t) {
        return t.estado && t.estado.toLowerCase() === estadoBuscado.toLowerCase();
    });
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
    if (contador === 0) {
        console.log("No hay tareas con ese estado.");
    }
    prompt("\nPresiona Enter para continuar...");
}
// --- FUNCIÓN BUSCAR TAREAS ---
function buscarTarea() {
    console.clear();
    console.log("--- Búsqueda de Tarea ---");
    let terminoBusqueda = prompt("Ingresa el título, descripción o estado de la tarea a buscar: ") || "";
    let terminoMinusc = terminoBusqueda.toLowerCase();
    const visibles = obtenerTareasVisibles(tareas);
    const resultados = visibles.filter(function (t) {
        return (t.titulo.toLowerCase().includes(terminoMinusc) ||
            t.descripcion.toLowerCase().includes(terminoMinusc) ||
            t.estado.toLowerCase().includes(terminoMinusc));
    });
    if (resultados.length === 0) {
        console.log("\nNo se encontraron tareas que coincidan con: " + terminoBusqueda);
    }
    else {
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
