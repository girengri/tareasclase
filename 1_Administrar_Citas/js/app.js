let DB;
const pacienteInput = document.querySelector("#paciente");
const telefonoInput = document.querySelector("#telefono");
const fechaInput = document.querySelector("#fecha");
const horaInput = document.querySelector("#hora");
const sintomasInput = document.querySelector("#sintomas");

// Contenedor para las citas
const contenedorCitas = document.querySelector("#citas");

// Formulario nuevas citas
const formulario = document.querySelector("#nueva-cita");
formulario.addEventListener("submit", nuevaCita);

// Heading
const heading = document.querySelector("#administra");

let editando = false;

window.onload = () => {
    eventListeners();

    crearDB();
};

// Eventos
function eventListeners() {
    pacienteInput.addEventListener("change", datosCita);
    telefonoInput.addEventListener("change", datosCita);
    fechaInput.addEventListener("change", datosCita);
    horaInput.addEventListener("change", datosCita);
    sintomasInput.addEventListener("change", datosCita);
}

const citaObjeto = {
    paciente: "",
    telefono: "",
    fecha: "",
    hora: "",
    sintomas: "",
};

function datosCita(e) {
    //  console.log(e.target.name) // Obtener el Input
    citaObjeto[e.target.name] = e.target.value;
}

// CLasses
class Citas {
    constructor() {
        this.citas = [];
    }
    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }
    editarCita(citaActualizada) {
        this.citas = this.citas.map((cita) =>
            cita.id === citaActualizada.id ? citaActualizada : cita
        );
    }

    eliminarCita(id) {
        this.citas = this.citas.filter((cita) => cita.id !== id);
    }
}

class UI {
    constructor({ citas }) {
        this.textoHeading(citas);
    }

    imprimirAlerta(mensaje, tipo) {
        // Crea el div
        const divMensaje = document.createElement("div");
        divMensaje.classList.add("text-center", "alert", "d-block", "col-12");

        // Si es de tipo error agrega una clase
        if (tipo === "error") {
            divMensaje.classList.add("alert-danger");
        } else {
            divMensaje.classList.add("alert-success");
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Insertar en el DOM
        document
            .querySelector("#contenido")
            .insertBefore(divMensaje, document.querySelector(".agregar-cita"));

        // Quitar el alert despues de 3 segundos
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    imprimirCitas() {
        this.limpiarHTML();

        this.textoHeading(citas);

        //Leer el contenido de la base de datos
        const objectStore = DB.transaction("citas").objectStore("citas");

        const fnTextoHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = () => {
            fnTextoHeading(total.result);
        };

        objectStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;

            if (cursor) {
                const { paciente, telefono, fecha, hora, sintomas, id } = cursor.value;

                const divCita = document.createElement("div");
                divCita.classList.add("cita", "p-3");
                divCita.dataset.id = id;

                // SCRIPTING DE LOS ELEMENTOS...
                const pacienteParrafo = document.createElement("h2");
                pacienteParrafo.classList.add("card-title", "font-weight-bolder");
                pacienteParrafo.innerHTML = `${paciente}`;

                const telefonoParrafo = document.createElement("p");
                telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Teléfono: </span> ${telefono}`;

                const fechaParrafo = document.createElement("p");
                fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`;

                const horaParrafo = document.createElement("p");
                horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`;

                const sintomasParrafo = document.createElement("p");
                sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas: </span> ${sintomas}`;

                // Agregar un botón de eliminar...
                const btnEliminar = document.createElement("button");
                btnEliminar.onclick = () => eliminarCita(id); // añade la opción de eliminar
                btnEliminar.classList.add("btn", "btn-danger", "mr-2");
                btnEliminar.innerHTML =
                    'Eliminar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

                // Añade un botón de editar...
                const btnEditar = document.createElement("button");
                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cita);

                btnEditar.classList.add("btn", "btn-info");
                btnEditar.innerHTML =
                    'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>';

                // Agregar al HTML
                divCita.appendChild(pacienteParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                contenedorCitas.appendChild(divCita);

                //Ve al siguiente elemento
                cursor.continue();
            }
        };
    }

    textoHeading(resultado) {
        if (resultado > 0) {
            heading.textContent = "Administra tus Citas ";
        } else {
            heading.textContent = "No hay Citas, comienza creando una";
        }
    }

    limpiarHTML() {
        while (contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
}

const administrarCitas = new Citas();
const ui = new UI(administrarCitas);

function nuevaCita(e) {
    e.preventDefault();

    const { paciente, telefono, fecha, hora, sintomas } = citaObjeto;

    // Validar
    if (
        paciente === "" ||
        telefono === "" ||
        fecha === "" ||
        hora === "" ||
        sintomas === ""
    ) {
        ui.imprimirAlerta("Todos los campos son Obligatorios", "error");

        return;
    }

    if (editando) {
        // Estamos editando
        administrarCitas.editarCita({ ...citaObjeto });

        //Edita en IndexDB
        const transaction = DB.transaction(["citas"], "readwrite");
        const objectStore = transaction.objectStore("citas");

        objectStore.put(citaObjeto);

        transaction.oncomplete = () => {
            ui.imprimirAlerta("Guardado Correctamente");

            formulario.querySelector('button[type="submit"]').textContent =
                "Crear Cita";

            editando = false;
        };

        transaction.onerror = () => {
            console;
        };
    } else {
        // Nuevo Registro

        // Generar un ID único
        citaObjeto.id = Date.now();

        // Añade la nueva cita
        administrarCitas.agregarCita({ ...citaObjeto });

        //Insertar Registro en IndexedDB
        const transaction = DB.transaction(["citas"], "readwrite");

        //Habilitar el objectstore
        const objectStore = transaction.objectStore("citas");

        //Insertar en la BD
        objectStore.add(citaObjeto);

        transaction.oncomplete = () => {
            console.log("Cita Agregada");

            // Mostrar mensaje de que todo esta bien...
            ui.imprimirAlerta("Se agregó correctamente");
        };
    }

    // Imprimir el HTML de citas
    ui.imprimirCitas();

    // Reinicia el objeto para evitar futuros problemas de validación
    reiniciarObjeto();

    // Reiniciar Formulario
    formulario.reset();
}

function reiniciarObjeto() {
    // Reiniciar el objeto
    citaObjeto.paciente = "";
    citaObjeto.telefono = "";
    citaObjeto.fecha = "";
    citaObjeto.hora = "";
    citaObjeto.sintomas = "";
}

function eliminarCita(id) {
    const transaction = DB.transaction(["citas"], "readwrite");
    const objectStore = transaction.objectStore(["citas"]);

    objectStore.delete(id);

    transaction.oncomplete = () => {
        ui.imprimirCitas();
    };

    transaction.onerror = () => {
        console.log("Hubo un error");
    };
}

function cargarEdicion(cita) {
    const { paciente, telefono, fecha, hora, sintomas, id } = cita;

    // Reiniciar el objeto
    citaObjeto.paciente = paciente;
    citaObjeto.telefono = telefono;
    citaObjeto.fecha = fecha;
    citaObjeto.hora = hora;
    citaObjeto.sintomas = sintomas;
    citaObjeto.id = id;

    // Llenar los Inputs
    pacienteInput.value = paciente;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    formulario.querySelector('button[type="submit"]').textContent =
        "Guardar Cambios";

    editando = true;
}

function crearDB() {
    //Crear la base de datos. Me pide el nombre de la base de datos y la version de esta
    const crearDB = window.indexedDB.open("citas", 1);

    //Si hay un error
    crearDB.onerror = () => {
        console.log("Hubo un error");
    };

    //Si todo sale bien
    crearDB.onsuccess = () => {
        console.log("BD Creada");

        DB = crearDB.result;

        //Mostrar citas al cargar (Pero Indexedb ya esta listo);
        ui.imprimirCitas();
    };

    //Definir el schema
    crearDB.onupgradeneeded = (e) => {
        const db = e.target.result;

        //Me pide el nombre de la base de datos y las configuraciones de esta
        const objectStore = db.createObjectStore("citas", {
            keyPath: "id", //Indice de cada dato
            autoIncrement: true,
        });

        //Definir todas las columnas
        objectStore.createIndex("paciente", "paciente", { unique: false });
        objectStore.createIndex("telefono", "telefono", { unique: false });
        objectStore.createIndex("fecha", "fecha", { unique: false });
        objectStore.createIndex("hora", "hora", { unique: false });
        objectStore.createIndex("sintomas", "sintomas", { unique: false });
        objectStore.createIndex("id", "id", { unique: true });

        console.log("DB creada y lista");
    };
}
