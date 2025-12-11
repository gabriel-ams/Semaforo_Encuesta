function doGet(e) {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Encuesta Síndrome de Burnout")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function processForm(formObject) {
  const SHEET_ID = "149wrGR3Zj_4bAMStZewXP21tQFPGvVd5Jlm_2fkjDOk";
  let ss;

  try {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } catch (e) {
    throw new Error("No se pudo abrir la hoja. Verifica ID/permisos.");
  }

  let sheetName = "Respuestas_Burnout";
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = [
      "Marca temporal",
      "Correo electrónico",
      "Carga Batería (P1)",
      "Niebla Mental (P2)",
      "Desconexión (P3)",
      "Resultado Semáforo", // Nueva columna
    ];
    sheet.appendRow(headers);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#e6e6e6");
  }

  // --- LÓGICA DE PUNTUACIÓN ---
  // Rojo = 1 pto, Amarillo = 2 ptos, Verde = 3 ptos
  let puntos = 0;

  // Pregunta 1: Batería
  if (formObject.pregunta1.includes("0% - 20%")) puntos += 1;
  else if (formObject.pregunta1.includes("21% - 60%")) puntos += 2;
  else puntos += 3; // 61% - 100%

  // Pregunta 2: Niebla Mental
  if (formObject.pregunta2 === "Frecuentemente") puntos += 1;
  else if (formObject.pregunta2 === "Algunas veces") puntos += 2;
  else puntos += 3; // Nunca

  // Pregunta 3: Desconexión
  if (formObject.pregunta3 === "No") puntos += 1;
  else if (formObject.pregunta3 === "Parcialmente") puntos += 2;
  else puntos += 3; // Sí, totalmente

  // Determinar color
  // Mínimo 3 ptos, Máximo 9 ptos.
  let colorSemaforo = "verde"; // Default
  if (puntos <= 4) colorSemaforo = "rojo";
  else if (puntos <= 7) colorSemaforo = "amarillo";

  // Guardar datos
  let email = Session.getActiveUser().getEmail() || "Anónimo / No detectado";
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    email,
    formObject.pregunta1,
    formObject.pregunta2,
    formObject.pregunta3,
    colorSemaforo.toUpperCase(), // Guardamos el resultado
  ]);

  // DEVOLVER EL COLOR AL HTML
  return colorSemaforo;
}
