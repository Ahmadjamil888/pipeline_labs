import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DatasetStats {
  rowCount: number;
  columnCount: number;
  columnNames: string[];
  columnTypes: Record<string, string>;
  missingValues: Record<string, number>;
  numericStats?: Record<string, { min: number; max: number; mean: number; std: number }>;
}

export interface ProcessOptions {
  normalize?: boolean;
  encoding?: 'onehot' | 'label' | 'none';
  handleMissing?: 'drop' | 'mean' | 'median' | 'mode' | 'constant';
  fillValue?: number | string;
  removeOutliers?: boolean;
  outlierMethod?: 'zscore' | 'iqr';
  outlierThreshold?: number;
  trainTestSplit?: boolean;
  testSize?: number;
  shuffle?: boolean;
  selectFeatures?: string[];
  dropFeatures?: string[];
}

export interface ProcessResult {
  data: Row[];
  columns: string[];
  originalShape: [number, number];
  processedShape: [number, number];
  operationsApplied: string[];
  columnChanges: {
    encoded: string[];
    normalized: string[];
    dropped: string[];
    imputed: Record<string, string>;
  };
}

type Row = Record<string, unknown>;

// ── Internal DataFrame-like structure ────────────────────────────────────────

class DataFrame {
  rows: Row[];
  cols: string[];

  constructor(rows: Row[]) {
    this.rows = rows;
    this.cols = rows.length > 0 ? Object.keys(rows[0]) : [];
  }

  get shape(): [number, number] {
    return [this.rows.length, this.cols.length];
  }

  get columns(): string[] {
    return this.cols;
  }

  get values(): unknown[][] {
    return this.rows.map(r => this.cols.map(c => r[c]));
  }

  column(name: string): unknown[] {
    return this.rows.map(r => r[name]);
  }

  copy(): DataFrame {
    return new DataFrame(this.rows.map(r => ({ ...r })));
  }

  head(n: number): DataFrame {
    return new DataFrame(this.rows.slice(0, n));
  }

  tail(n: number): DataFrame {
    return new DataFrame(this.rows.slice(-n));
  }
}

// ── File parsing ─────────────────────────────────────────────────────────────

export async function parseFile(
  file: Buffer | ArrayBuffer,
  fileType: string
): Promise<DataFrame> {
  if (fileType === 'csv' || fileType === 'text/csv') {
    const text = new TextDecoder().decode(file);
    const parsed = Papa.parse<Row>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
    return new DataFrame(parsed.data);
  }

  if (
    fileType === 'xlsx' || fileType === 'xls' ||
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileType === 'application/vnd.ms-excel'
  ) {
    const workbook = XLSX.read(file, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<Row>(firstSheet);
    return new DataFrame(jsonData);
  }

  if (fileType === 'json' || fileType === 'application/json') {
    const text = new TextDecoder().decode(file);
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : [data];
    return new DataFrame(rows);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

// ── Serialisation ─────────────────────────────────────────────────────────────

export function dataframeToCsv(df: DataFrame): string {
  if (df.rows.length === 0) return '';
  const headers = df.cols.join(',');
  const rows = df.rows.map(row =>
    df.cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

export function dataframeToJson(df: DataFrame): unknown[] {
  return df.rows;
}

// ── Statistics ────────────────────────────────────────────────────────────────

function inferType(values: unknown[]): string {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'string';
  if (nonNull.every(v => typeof v === 'number' && !isNaN(v as number))) return 'float64';
  if (nonNull.every(v => typeof v === 'boolean')) return 'bool';
  return 'string';
}

function numericStats(values: number[]) {
  const n = values.length;
  if (n === 0) return { min: 0, max: 0, mean: 0, std: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  return { min, max, mean, std };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mode(values: number[]): number {
  const freq: Record<number, number> = {};
  values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  return Number(Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
}

export function getDatasetStats(df: DataFrame): DatasetStats {
  const columnTypes: Record<string, string> = {};
  const missingValues: Record<string, number> = {};
  const numStats: Record<string, { min: number; max: number; mean: number; std: number }> = {};

  df.cols.forEach(col => {
    const vals = df.column(col);
    const nullCount = vals.filter(v => v === null || v === undefined || v === '').length;
    missingValues[col] = nullCount;
    const type = inferType(vals);
    columnTypes[col] = type;
    if (type === 'float64') {
      const nums = vals.filter(v => typeof v === 'number' && !isNaN(v as number)) as number[];
      numStats[col] = numericStats(nums);
    }
  });

  return {
    rowCount: df.shape[0],
    columnCount: df.shape[1],
    columnNames: df.cols,
    columnTypes,
    missingValues,
    numericStats: numStats,
  };
}

// ── Preprocessing operations ──────────────────────────────────────────────────

function isMissing(v: unknown): boolean {
  return v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v));
}

function handleMissingValues(
  rows: Row[],
  cols: string[],
  strategy: string,
  fillValue?: number | string
): { rows: Row[]; imputed: Record<string, string> } {
  const imputed: Record<string, string> = {};

  if (strategy === 'drop') {
    const before = rows.length;
    const filtered = rows.filter(row => cols.every(c => !isMissing(row[c])));
    imputed['_rows_dropped'] = String(before - filtered.length);
    return { rows: filtered, imputed };
  }

  const colStats: Record<string, { mean: number; median: number; mode: number }> = {};
  cols.forEach(col => {
    const nums = rows.map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v as number)) as number[];
    if (nums.length > 0) {
      const m = nums.reduce((a, b) => a + b, 0) / nums.length;
      colStats[col] = { mean: m, median: median(nums), mode: mode(nums) };
    }
  });

  const result = rows.map(row => {
    const newRow = { ...row };
    cols.forEach(col => {
      if (!isMissing(newRow[col])) return;
      const stats = colStats[col];
      if (strategy === 'mean' && stats) {
        newRow[col] = stats.mean;
        imputed[col] = `filled_mean(${stats.mean.toFixed(2)})`;
      } else if (strategy === 'median' && stats) {
        newRow[col] = stats.median;
        imputed[col] = `filled_median(${stats.median.toFixed(2)})`;
      } else if (strategy === 'mode' && stats) {
        newRow[col] = stats.mode;
        imputed[col] = `filled_mode(${stats.mode.toFixed(2)})`;
      } else if (strategy === 'constant') {
        newRow[col] = fillValue ?? 0;
        imputed[col] = `filled_constant(${fillValue})`;
      }
    });
    return newRow;
  });

  return { rows: result, imputed };
}

function normalizeFeatures(rows: Row[], cols: string[]): { rows: Row[]; normalized: string[] } {
  const normalized: string[] = [];
  const stats: Record<string, { mean: number; std: number }> = {};

  cols.forEach(col => {
    const nums = rows.map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v as number)) as number[];
    if (nums.length === 0) return;
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const std = Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length);
    if (std > 0) {
      stats[col] = { mean, std };
      normalized.push(col);
    }
  });

  const result = rows.map(row => {
    const newRow = { ...row };
    normalized.forEach(col => {
      if (typeof newRow[col] === 'number') {
        newRow[col] = ((newRow[col] as number) - stats[col].mean) / stats[col].std;
      }
    });
    return newRow;
  });

  return { rows: result, normalized };
}

function encodeCategorical(
  rows: Row[],
  cols: string[],
  method: 'onehot' | 'label'
): { rows: Row[]; encoded: string[]; newCols: string[] } {
  const encoded: string[] = [];
  let result = rows.map(r => ({ ...r }));
  const newCols: string[] = [];

  cols.forEach(col => {
    const vals = rows.map(r => r[col]);
    const unique = [...new Set(vals.filter(v => !isMissing(v)).map(v => String(v)))];
    if (unique.length < 2 || unique.length > 50) return;

    if (method === 'onehot') {
      unique.forEach(uv => {
        const colName = `${col}_${uv}`;
        result = result.map(row => ({ ...row, [colName]: row[col] === uv || String(row[col]) === uv ? 1 : 0 }));
        newCols.push(colName);
      });
      result = result.map(row => { const r = { ...row }; delete r[col]; return r; });
    } else {
      const map: Record<string, number> = Object.fromEntries(unique.map((v, i) => [v, i]));
      result = result.map(row => ({ ...row, [col]: map[String(row[col])] ?? 0 }));
    }
    encoded.push(col);
  });

  return { rows: result, encoded, newCols };
}

function removeOutliers(
  rows: Row[],
  cols: string[],
  method: 'zscore' | 'iqr',
  threshold: number
): { rows: Row[]; removed: number } {
  const before = rows.length;
  let result = rows;

  cols.forEach(col => {
    const nums = result.map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v as number)) as number[];
    if (nums.length === 0) return;

    if (method === 'zscore') {
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const std = Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length);
      if (std === 0) return;
      result = result.filter(row => {
        const v = row[col];
        if (typeof v !== 'number') return true;
        return Math.abs((v - mean) / std) <= threshold;
      });
    } else {
      const sorted = [...nums].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      result = result.filter(row => {
        const v = row[col];
        if (typeof v !== 'number') return true;
        return v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr;
      });
    }
  });

  return { rows: result, removed: before - result.length };
}

// ── Main preprocessing pipeline ───────────────────────────────────────────────

export async function preprocessDataset(
  df: DataFrame,
  options: ProcessOptions
): Promise<ProcessResult> {
  let rows = df.rows.map(r => ({ ...r }));
  let cols = [...df.cols];
  const operationsApplied: string[] = [];
  const columnChanges = {
    encoded: [] as string[],
    normalized: [] as string[],
    dropped: [] as string[],
    imputed: {} as Record<string, string>,
  };
  const originalShape: [number, number] = [df.shape[0], df.shape[1]];

  // 1. Handle missing values
  if (options.handleMissing && options.handleMissing !== 'drop') {
    const { rows: r, imputed } = handleMissingValues(rows, cols, options.handleMissing, options.fillValue);
    rows = r;
    columnChanges.imputed = imputed;
    operationsApplied.push(`Missing values handled with ${options.handleMissing}`);
  }

  // 2. Remove outliers
  if (options.removeOutliers) {
    const numericCols = cols.filter(c => rows.some(r => typeof r[c] === 'number'));
    const { rows: r, removed } = removeOutliers(
      rows, numericCols,
      options.outlierMethod ?? 'zscore',
      options.outlierThreshold ?? 3
    );
    rows = r;
    operationsApplied.push(`Removed ${removed} outliers using ${options.outlierMethod ?? 'zscore'}`);
  }

  // 3. Encode categorical variables
  if (options.encoding && options.encoding !== 'none') {
    const catCols = cols.filter(c => {
      const vals = rows.map(r => r[c]).filter(v => !isMissing(v));
      return vals.length > 0 && vals.every(v => typeof v === 'string');
    });
    if (catCols.length > 0) {
      const { rows: r, encoded, newCols } = encodeCategorical(rows, catCols, options.encoding);
      rows = r;
      columnChanges.encoded = encoded;
      // Update cols list
      cols = cols.filter(c => !encoded.includes(c));
      if (options.encoding === 'onehot') cols = [...cols, ...newCols];
      else cols = [...cols];
      operationsApplied.push(`Encoded ${encoded.length} categorical columns with ${options.encoding}`);
    }
  }

  // 4. Normalize numeric features
  if (options.normalize) {
    const numericCols = cols.filter(c => rows.some(r => typeof r[c] === 'number'));
    if (numericCols.length > 0) {
      const { rows: r, normalized } = normalizeFeatures(rows, numericCols);
      rows = r;
      columnChanges.normalized = normalized;
      operationsApplied.push(`Normalized ${normalized.length} numeric columns (z-score)`);
    }
  }

  // 5. Feature selection / drop
  if (options.selectFeatures && options.selectFeatures.length > 0) {
    const toDrop = cols.filter(c => !options.selectFeatures!.includes(c));
    rows = rows.map(r => {
      const newRow: Row = {};
      options.selectFeatures!.forEach(c => { newRow[c] = r[c]; });
      return newRow;
    });
    cols = options.selectFeatures;
    columnChanges.dropped = toDrop;
    operationsApplied.push(`Selected ${options.selectFeatures.length} features, dropped ${toDrop.length}`);
  }

  if (options.dropFeatures && options.dropFeatures.length > 0) {
    rows = rows.map(r => {
      const newRow = { ...r };
      options.dropFeatures!.forEach(c => delete newRow[c]);
      return newRow;
    });
    cols = cols.filter(c => !options.dropFeatures!.includes(c));
    columnChanges.dropped = [...columnChanges.dropped, ...options.dropFeatures];
    operationsApplied.push(`Dropped ${options.dropFeatures.length} features`);
  }

  // 6. Drop rows with missing values (if strategy is drop)
  if (options.handleMissing === 'drop') {
    const before = rows.length;
    rows = rows.filter(row => cols.every(c => !isMissing(row[c])));
    const dropped = before - rows.length;
    if (dropped > 0) operationsApplied.push(`Dropped ${dropped} rows with missing values`);
  }

  const processedShape: [number, number] = [rows.length, cols.length];

  return {
    data: rows,
    columns: cols,
    originalShape,
    processedShape,
    operationsApplied,
    columnChanges,
  };
}

// ── Instruction parser ────────────────────────────────────────────────────────

export function parseInstructions(instructions: string): ProcessOptions {
  const lower = instructions.toLowerCase();
  const options: ProcessOptions = {};

  if (lower.includes('normaliz') || lower.includes('scale') || lower.includes('standardiz')) {
    options.normalize = true;
  }

  if (lower.includes('one-hot') || lower.includes('one hot') || lower.includes('encode categorical')) {
    options.encoding = 'onehot';
  } else if (lower.includes('label encod')) {
    options.encoding = 'label';
  }

  if (lower.includes('drop') && lower.includes('missing')) {
    options.handleMissing = 'drop';
  } else if (lower.includes('mean') && lower.includes('impute')) {
    options.handleMissing = 'mean';
  } else if (lower.includes('median')) {
    options.handleMissing = 'median';
  } else if (lower.includes('mode')) {
    options.handleMissing = 'mode';
  } else if (lower.includes('missing') || lower.includes('null') || lower.includes('nan')) {
    options.handleMissing = 'mean';
  }

  if (lower.includes('remove outlier') || lower.includes('outlier removal') || lower.includes('outlier')) {
    options.removeOutliers = true;
    options.outlierMethod = lower.includes('iqr') ? 'iqr' : 'zscore';
  }

  if (lower.includes('train') && lower.includes('test') && lower.includes('split')) {
    options.trainTestSplit = true;
    const match = lower.match(/(\d+)%?\s*test/);
    if (match) {
      const percent = parseInt(match[1], 10);
      options.testSize = percent > 1 ? percent / 100 : percent;
    } else {
      options.testSize = 0.2;
    }
    options.shuffle = !lower.includes('no shuffl') && !lower.includes('without shuffl');
  }

  return options;
}
