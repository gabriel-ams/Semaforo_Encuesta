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
    throw new Error(
      "No se pudo abrir la hoja de cálculo. Verifica el ID o los permisos."
    );
  }

  // Use a specific sheet name or default to the first one/create one
  let sheetName = "Respuestas_Burnout";
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Initialize headers if new sheet
    const headers = [
      "Marca temporal",
      "Correo electrónico",
      "Carga Batería (P1)",
      "Niebla Mental (P2)",
      "Desconexión (P3)",
    ];
    sheet.appendRow(headers);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#e6e6e6");
  }

  // Get User Email
  let email = Session.getActiveUser().getEmail();
  if (!email) {
    // If running as "Me" (developer) and accessed by "Anyone (anonymous)", email might be blank.
    // If running as "User accessing the web app", they must authorize.
    email = "Anónimo / No detectado";
  }

  // Prepare row data
  const timestamp = new Date();
  const rowData = [
    timestamp,
    email,
    formObject.pregunta1,
    formObject.pregunta2,
    formObject.pregunta3,
  ];

  // Append response
  sheet.appendRow(rowData);

  return true;
}

/**
 * Función manual para inicializar la hoja si se desea ejecutar desde el editor.
 */
function setupSheet() {
  const SHEET_ID = "149wrGR3Zj_4bAMStZewXP21tQFPGvVd5Jlm_2fkjDOk";
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetName = "Respuestas_Burnout";
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("Hoja creada: " + sheetName);
  } else {
    Logger.log("La hoja ya existe.");
  }

  const headers = [
    "Marca temporal",
    "Correo electrónico",
    "Carga Batería (P1)",
    "Niebla Mental (P2)",
    "Desconexión (P3)",
  ];

  // Check if headers exist (simplistic check)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#e6e6e6");
    Logger.log("Encabezados agregados.");
  }
}
