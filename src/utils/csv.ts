import type { CarData } from '../types';

// Column mapping from CSV headers to CarData fields
const HEADER_MAP: Record<string, keyof CarData> = {
  // Car name variations
  'car': 'car',
  'car name': 'car',
  'name': 'car',

  // Wheelbase/Track width
  'height': 'height',
  'f axle offset': 'fAxleOffset',
  'front axle offset': 'fAxleOffset',
  'r axle offset': 'rAxleOffset',
  'rear axle offset': 'rAxleOffset',
  'wheelbase': 'wheelbase',
  'f track width': 'fTrackWidth',
  'front track width': 'fTrackWidth',
  'r track width': 'rTrackWidth',
  'rear track width': 'rTrackWidth',
  'av track width': 'avTrackWidth',
  'average track width': 'avTrackWidth',

  // Transmission
  'gears': 'gears',
  'shift time': 'shiftTime',
  'weight': 'weight',

  // Body - Stock
  'cx': 'stockCx',
  'stock cx': 'stockCx',
  'sx': 'stockSx',
  'stock sx': 'stockSx',
  'drag': 'stockDrag',
  'stock drag': 'stockDrag',

  // Body - Stage 1/2 (these need context from grouped headers)
  'stage12 cx': 'stage12Cx',
  'stage 1/2 cx': 'stage12Cx',
  'stage12 sx': 'stage12Sx',
  'stage 1/2 sx': 'stage12Sx',
  'stage12 drag': 'stage12Drag',
  'stage 1/2 drag': 'stage12Drag',

  // Body - Stage 3/4
  'stage34 cx': 'stage34Cx',
  'stage 3/4 cx': 'stage34Cx',
  'stage34 sx': 'stage34Sx',
  'stage 3/4 sx': 'stage34Sx',
  'stage34 drag': 'stage34Drag',
  'stage 3/4 drag': 'stage34Drag',

  // Position offsets (body)
  'position offset x': 'bodyPosX',
  'body position x': 'bodyPosX',
  'position offset y': 'bodyPosY',
  'body position y': 'bodyPosY',
  'position offset z': 'bodyPosZ',
  'body position z': 'bodyPosZ',

  // Engine
  'power hp': 'powerHp',
  'power': 'powerHp',
  'hp': 'powerHp',
  'mass kg': 'massKg',
  'mass': 'massKg',
  'turbo press': 'turboPress',
  'turbo press.': 'turboPress',
  'turbo pressure': 'turboPress',
  'curve fall @ rpm': 'curveFallRpm',
  'curve fall @rpm': 'curveFallRpm',
  'curve fall rpm': 'curveFallRpm',
  'rev limiter': 'revLimiter',
  'inertia ratio': 'inertiaRatio',
  'inertia': 'inertiaRatio',

  // Engine position offsets
  'engine position x': 'enginePosX',
  'engine pos x': 'enginePosX',
  'engine position y': 'enginePosY',
  'engine pos y': 'enginePosY',
  'engine position z': 'enginePosZ',
  'engine pos z': 'enginePosZ',
};

// CSV column order for export (matches the spreadsheet structure)
export const CSV_COLUMNS: { key: keyof CarData; header: string }[] = [
  // Car
  { key: 'car', header: 'Car' },

  // Wheelbase/Track
  { key: 'height', header: 'Height' },
  { key: 'fAxleOffset', header: 'F axle offset' },
  { key: 'rAxleOffset', header: 'R axle offset' },
  { key: 'wheelbase', header: 'Wheelbase' },
  { key: 'fTrackWidth', header: 'F track width' },
  { key: 'rTrackWidth', header: 'R track width' },
  { key: 'avTrackWidth', header: 'AV track width' },

  // Transmission
  { key: 'gears', header: 'Gears' },
  { key: 'shiftTime', header: 'Shift time' },
  { key: 'weight', header: 'Weight' },

  // Body - Stock
  { key: 'stockCx', header: 'Stock CX' },
  { key: 'stockSx', header: 'Stock SX' },
  { key: 'stockDrag', header: 'Stock Drag' },

  // Body - Stage 1/2
  { key: 'stage12Cx', header: 'Stage 1/2 CX' },
  { key: 'stage12Sx', header: 'Stage 1/2 SX' },
  { key: 'stage12Drag', header: 'Stage 1/2 Drag' },

  // Body - Stage 3/4
  { key: 'stage34Cx', header: 'Stage 3/4 CX' },
  { key: 'stage34Sx', header: 'Stage 3/4 SX' },
  { key: 'stage34Drag', header: 'Stage 3/4 Drag' },

  // Body - Position
  { key: 'bodyPosX', header: 'Body Position X' },
  { key: 'bodyPosY', header: 'Body Position Y' },
  { key: 'bodyPosZ', header: 'Body Position Z' },

  // Engine
  { key: 'powerHp', header: 'Power HP' },
  { key: 'massKg', header: 'Mass Kg' },
  { key: 'turboPress', header: 'Turbo Press.' },
  { key: 'curveFallRpm', header: 'Curve fall @ RPM' },
  { key: 'revLimiter', header: 'Rev limiter' },
  { key: 'inertiaRatio', header: 'Inertia ratio' },

  // Engine - Position
  { key: 'enginePosX', header: 'Engine Position X' },
  { key: 'enginePosY', header: 'Engine Position Y' },
  { key: 'enginePosZ', header: 'Engine Position Z' },
];

/**
 * Parse a numeric value, returning null for empty/NA values
 */
function parseNumericValue(value: string): number | null {
  const trimmed = value.trim();

  // Handle empty or NA values
  if (trimmed === '' || trimmed.toLowerCase() === 'na' || trimmed === '-') {
    return null;
  }

  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

/**
 * Normalize header string for matching
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Parse CSV text into an array of CarData objects
 */
export function parseCSV(csvText: string): CarData[] {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return [];
  }

  // Parse header row - handle both comma and tab delimited
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = parseCSVLine(lines[0], delimiter);

  // Map headers to CarData field indices
  const columnMapping: { index: number; field: keyof CarData }[] = [];

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    const field = HEADER_MAP[normalized];
    if (field) {
      columnMapping.push({ index, field });
    }
  });

  // If we didn't find a car column but have data, try to use column order
  if (columnMapping.length === 0) {
    // Assume columns are in the expected order from the spreadsheet
    return parseCSVByColumnOrder(lines, delimiter);
  }

  // Parse data rows
  const data: CarData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);
    const row = createEmptyCarData();

    columnMapping.forEach(({ index, field }) => {
      const value = values[index] || '';
      if (field === 'car') {
        row.car = value.trim();
      } else {
        (row[field] as number | null) = parseNumericValue(value);
      }
    });

    // Only add rows that have a car name
    if (row.car) {
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse CSV when headers don't match - assume column order from spreadsheet
 */
function parseCSVByColumnOrder(lines: string[], delimiter: string): CarData[] {
  const data: CarData[] = [];

  // Skip first 3 rows if they look like headers (spreadsheet has multi-row headers)
  let startRow = 1;

  // Check if first data row looks like a header
  const firstDataRow = parseCSVLine(lines[1] || '', delimiter);
  if (firstDataRow.length > 0 && isNaN(parseFloat(firstDataRow[1] || ''))) {
    startRow = 3; // Skip grouped headers
  }

  for (let i = startRow; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);
    if (values.length < 2) continue;

    const row = createEmptyCarData();

    // Map by position (based on spreadsheet column order)
    row.car = values[0]?.trim() || '';
    row.height = parseNumericValue(values[1] || '');
    row.fAxleOffset = parseNumericValue(values[2] || '');
    row.rAxleOffset = parseNumericValue(values[3] || '');
    row.wheelbase = parseNumericValue(values[4] || '');
    row.fTrackWidth = parseNumericValue(values[5] || '');
    row.rTrackWidth = parseNumericValue(values[6] || '');
    row.avTrackWidth = parseNumericValue(values[7] || '');
    row.gears = parseNumericValue(values[8] || '');
    row.shiftTime = parseNumericValue(values[9] || '');
    row.weight = parseNumericValue(values[10] || '');
    row.stockCx = parseNumericValue(values[11] || '');
    row.stockSx = parseNumericValue(values[12] || '');
    row.stockDrag = parseNumericValue(values[13] || '');
    row.stage12Cx = parseNumericValue(values[14] || '');
    row.stage12Sx = parseNumericValue(values[15] || '');
    row.stage12Drag = parseNumericValue(values[16] || '');
    row.stage34Cx = parseNumericValue(values[17] || '');
    row.stage34Sx = parseNumericValue(values[18] || '');
    row.stage34Drag = parseNumericValue(values[19] || '');
    row.bodyPosX = parseNumericValue(values[20] || '');
    row.bodyPosY = parseNumericValue(values[21] || '');
    row.bodyPosZ = parseNumericValue(values[22] || '');
    row.powerHp = parseNumericValue(values[23] || '');
    row.massKg = parseNumericValue(values[24] || '');
    row.turboPress = parseNumericValue(values[25] || '');
    row.curveFallRpm = parseNumericValue(values[26] || '');
    row.revLimiter = parseNumericValue(values[27] || '');
    row.inertiaRatio = parseNumericValue(values[28] || '');
    row.enginePosX = parseNumericValue(values[29] || '');
    row.enginePosY = parseNumericValue(values[30] || '');
    row.enginePosZ = parseNumericValue(values[31] || '');

    if (row.car) {
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Create an empty CarData object with all fields initialized
 */
export function createEmptyCarData(): CarData {
  return {
    car: '',
    height: null,
    fAxleOffset: null,
    rAxleOffset: null,
    wheelbase: null,
    fTrackWidth: null,
    rTrackWidth: null,
    avTrackWidth: null,
    gears: null,
    shiftTime: null,
    weight: null,
    stockCx: null,
    stockSx: null,
    stockDrag: null,
    stage12Cx: null,
    stage12Sx: null,
    stage12Drag: null,
    stage34Cx: null,
    stage34Sx: null,
    stage34Drag: null,
    bodyPosX: null,
    bodyPosY: null,
    bodyPosZ: null,
    powerHp: null,
    massKg: null,
    turboPress: null,
    curveFallRpm: null,
    revLimiter: null,
    inertiaRatio: null,
    enginePosX: null,
    enginePosY: null,
    enginePosZ: null,
  };
}

/**
 * Export CarData array to CSV string
 */
export function exportCSV(data: CarData[]): string {
  if (data.length === 0) {
    return '';
  }

  // Generate header row
  const headers = CSV_COLUMNS.map((col) => col.header);
  const lines = [headers.join(',')];

  // Generate data rows
  for (const row of data) {
    const values = CSV_COLUMNS.map((col) => {
      const value = row[col.key];

      if (value === null || value === undefined) {
        return '';
      }

      // Handle string values (car name might contain commas)
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }

      return String(value);
    });

    lines.push(values.join(','));
  }

  return lines.join('\n');
}

/**
 * Download CSV data as a file
 */
export function downloadCSV(data: CarData[], filename = 'car-data.csv'): void {
  const csv = exportCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
