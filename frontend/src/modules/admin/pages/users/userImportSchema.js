import * as XLSX from "xlsx";

export const USER_IMPORT_COLUMNS = [
  "Name",
  "Email",
  "Mobile",
  "Gender",
  "Country",
];

const parseCsvHeader = (text = "") => {
  const firstRow = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .find(Boolean);

  if (!firstRow) return [];

  const columns = [];
  let current = "";
  let insideQuote = false;

  for (let index = 0; index < firstRow.length; index += 1) {
    const char = firstRow[index];
    const nextChar = firstRow[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === "," && !insideQuote) {
      columns.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  columns.push(current.trim());
  return columns;
};

const normalizeColumn = (column = "") =>
  column
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();

const hasExpectedColumnsOnly = (columns = []) => {
  const normalizedColumns = columns.map(normalizeColumn);
  const normalizedExpectedColumns = USER_IMPORT_COLUMNS.map(normalizeColumn);

  return (
    normalizedColumns.length === normalizedExpectedColumns.length &&
    new Set(normalizedColumns).size === normalizedExpectedColumns.length &&
    normalizedExpectedColumns.every((column) =>
      normalizedColumns.includes(column),
    )
  );
};

export const validateUserImportFile = async (file) => {
  if (!file) {
    return {
      valid: false,
      message: "Select a file before creating the import.",
    };
  }

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx")) {
    return { valid: false, message: "Select a CSV or XLSX file." };
  }

  if (fileName.endsWith(".csv")) {
    const headerColumns = parseCsvHeader(await file.slice(0, 4096).text());
    if (!hasExpectedColumnsOnly(headerColumns)) {
      return {
        valid: false,
        message: `CSV columns must be exactly: ${USER_IMPORT_COLUMNS.join(", ")}.`,
      };
    }
  } else if (fileName.endsWith(".xlsx")) {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (json.length === 0) {
        return { valid: false, message: "Excel file is empty." };
      }
      const headerColumns = json[0] || [];
      if (!hasExpectedColumnsOnly(headerColumns)) {
        return {
          valid: false,
          message: `Excel columns must be exactly: ${USER_IMPORT_COLUMNS.join(", ")}.`,
        };
      }
    } catch (err) {
      console.error("Excel parse error:", err);
      return { valid: false, message: "Could not read Excel file." };
    }
  }

  return { valid: true, message: "" };
};
