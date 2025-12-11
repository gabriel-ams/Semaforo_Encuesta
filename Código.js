function doGet(e) {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Encuesta Síndrome de Burnout")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function processForm(formObject, nombreUsuarioInput) {
  const SHEET_ID = "149wrGR3Zj_4bAMStZewXP21tQFPGvVd5Jlm_2fkjDOk";
  let ss;

  try {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } catch (e) {
    throw new Error("No se pudo abrir la hoja. Verifica ID/permisos.");
  }

  // 1. OBTENER IDENTIFICACIÓN (EMAIL)
  let email = Session.getActiveUser().getEmail();

  if (!email) {
    email = "usuario_anonimo";
  }

  // 2. VERIFICAR REGISTRO EN HOJA "CORREOS"
  let hojaCorreos = ss.getSheetByName("Correos");
  if (!hojaCorreos) {
    hojaCorreos = ss.insertSheet("Correos");
    hojaCorreos.appendRow(["Email", "Nombre Completo", "Fecha Registro"]);
    hojaCorreos
      .getRange(1, 1, 1, 3)
      .setFontWeight("bold")
      .setBackground("#b6d7a8");
  }

  let nombreUsuario = "";
  let usuarioEncontrado = false;
  const datosCorreos = hojaCorreos.getDataRange().getValues();

  // Buscar el email en la columna A (índice 0)
  for (let i = 1; i < datosCorreos.length; i++) {
    if (datosCorreos[i][0] === email) {
      nombreUsuario = datosCorreos[i][1]; // El nombre está en la columna B
      usuarioEncontrado = true;
      break;
    }
  }

  // CASO A: USUARIO NUEVO Y SIN NOMBRE (Retornar petición de nombre)
  if (!usuarioEncontrado && !nombreUsuarioInput) {
    return { status: "necesita_nombre" };
  }

  // CASO B: USUARIO NUEVO PERO YA ENVIÓ EL NOMBRE (Registrarlo)
  if (!usuarioEncontrado && nombreUsuarioInput) {
    nombreUsuario = nombreUsuarioInput;
    // Guardar en base de datos maestra
    hojaCorreos.appendRow([email, nombreUsuario, new Date()]);
  }

  // 3. GESTIONAR LA HOJA PERSONAL DEL USUARIO
  // El nombre de la hoja será el nombre del usuario.
  let nombreHojaPersonal = nombreUsuario.replace(/[:\/\\?*\[\]]/g, "");
  let hojaPersonal = ss.getSheetByName(nombreHojaPersonal);

  if (!hojaPersonal) {
    hojaPersonal = ss.insertSheet(nombreHojaPersonal);
    const headers = [
      "Marca temporal",
      "Email",
      "Carga Batería (P1)",
      "Niebla Mental (P2)",
      "Desconexión (P3)",
      "Resultado Semáforo",
    ];
    hojaPersonal.appendRow(headers);
    hojaPersonal
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#e6e6e6");
  }

  // 4. CALCULAR RESULTADO (Lógica del Semáforo)
  let puntos = 0;

  // Pregunta 1
  if (formObject.pregunta1.includes("0% - 20%")) puntos += 1;
  else if (formObject.pregunta1.includes("21% - 60%")) puntos += 2;
  else puntos += 3;

  // Pregunta 2
  if (formObject.pregunta2 === "Frecuentemente") puntos += 1;
  else if (formObject.pregunta2 === "Algunas veces") puntos += 2;
  else puntos += 3;

  // Pregunta 3
  if (formObject.pregunta3 === "No") puntos += 1;
  else if (formObject.pregunta3 === "Parcialmente") puntos += 2;
  else puntos += 3;

  let colorSemaforo = "verde";
  if (puntos <= 4) colorSemaforo = "rojo";
  else if (puntos <= 7) colorSemaforo = "amarillo";

  // 5. GUARDAR DATOS EN LA HOJA PERSONAL
  hojaPersonal.appendRow([
    new Date(),
    email,
    formObject.pregunta1,
    formObject.pregunta2,
    formObject.pregunta3,
    colorSemaforo.toUpperCase(),
  ]);

  // Retornar éxito y color
  return { status: "exito", color: colorSemaforo };
}
