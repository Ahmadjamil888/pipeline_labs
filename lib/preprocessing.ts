import * as dfd from 'danfojs';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
  data: dfd.DataFrame;
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

// Parse file to DataFrame
export async function parseFile(
  file: Buffer | ArrayBuffer,
  fileType: string
): Promise<dfd.DataFrame> {
  let dataFrame: dfd.DataFrame;
  
  if (fileType === 'csv' || fileType === 'text/csv') {
    const text = new TextDecoder().decode(file);
    const parsed = Papa.parse(text, { header: true, dynamicTyping: true });
    dataFrame = new dfd.DataFrame(parsed.data);
  } else if (fileType === 'xlsx' || fileType === 'xls' || 
             fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             fileType === 'application/vnd.ms-excel') {
    const workbook = XLSX.read(file, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
    dataFrame = new dfd.DataFrame(jsonData);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
  
  return dataFrame;
}

// Convert DataFrame to CSV
export function dataframeToCsv(df: dfd.DataFrame): string {
  return dfd.toCSV(df);
}

// Convert DataFrame to JSON
export function dataframeToJson(df: dfd.DataFrame): unknown[] {
  return df.toJSON();
}

// Get dataset statistics
export function getDatasetStats(df: dfd.DataFrame): DatasetStats {
  const columnNames = df.columns;
  const columnTypes: Record<string, string> = {};
  const missingValues: Record<string, number> = {};
  
  columnNames.forEach(col => {
    const series = df.column(col);
    const dtype = series.dtype;
    columnTypes[col] = dtype;
    
    // Count missing values
    const nullCount = series.values.filter((v: unknown) => 
      v === null || v === undefined || v === '' || Number.isNaN(v)
    ).length;
    missingValues[col] = nullCount;
  });
  
  return {
    rowCount: df.shape[0],
    columnCount: df.shape[1],
    columnNames,
    columnTypes,
    missingValues,
  };
}

// Handle missing values
export function handleMissingValues(
  df: dfd.DataFrame,
  strategy: string,
  fillValue?: number | string
): dfd.DataFrame {
  let result = df.copy();
  const imputed: Record<string, string> = {};
  
  const columns = df.columns;
  
  columns.forEach(col => {
    const series = df.column(col);
    const hasMissing = series.values.some((v: unknown) => 
      v === null || v === undefined || v === '' || Number.isNaN(v)
    );
    
    if (!hasMissing) return;
    
    if (strategy === 'drop') {
      result = result.dropNa({ axis: 0, subset: [col] });
      imputed[col] = 'dropped_rows';
    } else if (['mean', 'median', 'mode'].includes(strategy)) {
      const numericSeries = series.asType('float32');
      let fill: number;
      
      if (strategy === 'mean') {
        fill = numericSeries.mean();
        imputed[col] = `filled_mean(${fill.toFixed(2)})`;
      } else if (strategy === 'median') {
        fill = numericSeries.median();
        imputed[col] = `filled_median(${fill.toFixed(2)})`;
      } else {
        fill = numericSeries.mode()[0] || 0;
        imputed[col] = `filled_mode(${fill.toFixed(2)})`;
      }
      
      result = result.fillNa(fill, { columns: [col] });
    } else if (strategy === 'constant') {
      result = result.fillNa(fillValue ?? 0, { columns: [col] });
      imputed[col] = `filled_constant(${fillValue})`;
    }
  });
  
  return result;
}

// Normalize numeric columns
export function normalizeFeatures(
  df: dfd.DataFrame,
  columns?: string[]
): { df: dfd.DataFrame; normalized: string[] } {
  let result = df.copy();
  const normalized: string[] = [];
  
  const targetColumns = columns || df.columns.filter(col => {
    const dtype = df.column(col).dtype;
    return dtype === 'float32' || dtype === 'int32' || dtype === 'int64';
  });
  
  targetColumns.forEach(col => {
    const series = df.column(col).asType('float32');
    const mean = series.mean();
    const std = series.std();
    
    if (std !== 0) {
      const normalizedValues = series.sub(mean).div(std);
      result = result.drop({ columns: [col] });
      result.addColumn(col, normalizedValues, { inplace: true });
      normalized.push(col);
    }
  });
  
  return { df: result, normalized };
}

// One-hot encode categorical columns
export function encodeCategorical(
  df: dfd.DataFrame,
  columns?: string[],
  method: 'onehot' | 'label' = 'onehot'
): { df: dfd.DataFrame; encoded: string[] } {
  let result = df.copy();
  const encoded: string[] = [];
  
  const targetColumns = columns || df.columns.filter(col => {
    const dtype = df.column(col).dtype;
    return dtype === 'string' || dtype === 'object';
  });
  
  if (method === 'onehot') {
    targetColumns.forEach(col => {
      const values = df.column(col).values as (string | number | boolean | null | undefined)[];
      const uniqueValues = [...new Set(values.filter(v => v !== null && v !== undefined))];
      if (uniqueValues.length > 1 && uniqueValues.length <= 50) {
        uniqueValues.forEach(val => {
          const newColName = `${col}_${String(val)}`;
          const binaryValues = values.map((v) => v === val ? 1 : 0);
          result = result.drop({ columns: [col] });
          result.addColumn(newColName, binaryValues, { inplace: true });
        });
        encoded.push(col);
      }
    });
  } else if (method === 'label') {
    targetColumns.forEach(col => {
      const values = df.column(col).values as (string | number | boolean | null | undefined)[];
      const uniqueValues = [...new Set(values.filter(v => v !== null && v !== undefined))];
      const valueMap = Object.fromEntries(uniqueValues.map((v, i) => [String(v), i]));
      const labelValues = values.map((v) => valueMap[String(v)] ?? 0);
      result = result.drop({ columns: [col] });
      result.addColumn(col, labelValues, { inplace: true });
      encoded.push(col);
    });
  }
  
  return { df: result, encoded };
}

// Remove outliers using Z-score or IQR
export function removeOutliers(
  df: dfd.DataFrame,
  columns?: string[],
  method: 'zscore' | 'iqr' = 'zscore',
  threshold: number = 3
): { df: dfd.DataFrame; removed: number } {
  let result = df.copy();
  const originalCount = result.shape[0];
  
  const numericColumns = columns || df.columns.filter(col => {
    const dtype = df.column(col).dtype;
    return dtype === 'float32' || dtype === 'int32' || dtype === 'int64';
  });
  
  if (method === 'zscore') {
    numericColumns.forEach(col => {
      const series = df.column(col).asType('float32');
      const mean = series.mean();
      const std = series.std();
      
      const numValues = series.values as number[];
      const mask = numValues.map((v: number) => {
        const zscore = Math.abs((v - mean) / std);
        return zscore <= threshold;
      });
      
      const indices = mask.map((keep, idx) => keep ? idx : -1).filter(i => i !== -1);
      result = (result as unknown as { iloc: (indices: number[]) => typeof result }).iloc(indices);
    });
  } else if (method === 'iqr') {
    numericColumns.forEach(col => {
      const series = df.column(col).asType('float32');
      const numValues = series.values as number[];
      const sorted = [...numValues].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      
      const mask = numValues.map((v: number) => {
        return v >= (q1 - 1.5 * iqr) && v <= (q3 + 1.5 * iqr);
      });
      
      const indices = mask.map((keep, idx) => keep ? idx : -1).filter(i => i !== -1);
      result = (result as unknown as { iloc: (indices: number[]) => typeof result }).iloc(indices);
    });
  }
  
  const removed = originalCount - result.shape[0];
  return { df: result, removed };
}

// Train-test split
export function trainTestSplit(
  df: dfd.DataFrame,
  testSize: number = 0.2,
  shuffle: boolean = true
): { train: dfd.DataFrame; test: dfd.DataFrame } {
  let data = df.copy();
  
  if (shuffle) {
    data = data.sample(data.shape[0]);
  }
  
  const splitIndex = Math.floor(data.shape[0] * (1 - testSize));
  
  const train = data.head(splitIndex);
  const test = data.tail(data.shape[0] - splitIndex);
  
  return { train, test };
}

// Main preprocessing function
export async function preprocessDataset(
  df: dfd.DataFrame,
  options: ProcessOptions
): Promise<ProcessResult> {
  let result = df.copy();
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
    result = handleMissingValues(result, options.handleMissing);
    operationsApplied.push(`Missing values handled with ${options.handleMissing}`);
  }
  
  // 2. Remove outliers
  if (options.removeOutliers) {
    const { df: cleaned, removed } = removeOutliers(
      result,
      undefined,
      options.outlierMethod,
      options.outlierThreshold
    );
    result = cleaned;
    operationsApplied.push(`Removed ${removed} outliers using ${options.outlierMethod || 'zscore'}`);
  }
  
  // 3. Encode categorical variables
  if (options.encoding && options.encoding !== 'none') {
    const { df: encoded, encoded: cols } = encodeCategorical(result, undefined, options.encoding);
    result = encoded;
    columnChanges.encoded = cols;
    operationsApplied.push(`Encoded ${cols.length} categorical columns with ${options.encoding}`);
  }
  
  // 4. Normalize numeric features
  if (options.normalize) {
    const { df: normalized, normalized: cols } = normalizeFeatures(result);
    result = normalized;
    columnChanges.normalized = cols;
    operationsApplied.push(`Normalized ${cols.length} numeric columns (z-score)`);
  }
  
  // 5. Feature selection
  if (options.selectFeatures && options.selectFeatures.length > 0) {
    const currentCols = result.columns;
    const toDrop = currentCols.filter(col => !options.selectFeatures!.includes(col));
    if (toDrop.length > 0) {
      result = result.drop({ columns: toDrop });
      columnChanges.dropped = toDrop;
      operationsApplied.push(`Selected ${options.selectFeatures.length} features, dropped ${toDrop.length}`);
    }
  }
  
  if (options.dropFeatures && options.dropFeatures.length > 0) {
    result = result.drop({ columns: options.dropFeatures });
    columnChanges.dropped = [...columnChanges.dropped, ...options.dropFeatures];
    operationsApplied.push(`Dropped ${options.dropFeatures.length} features`);
  }
  
  // 6. Handle missing values (drop rows if still have missing)
  if (options.handleMissing === 'drop') {
    const beforeCount = result.shape[0];
    result = handleMissingValues(result, 'drop');
    const dropped = beforeCount - result.shape[0];
    if (dropped > 0) {
      operationsApplied.push(`Dropped ${dropped} rows with missing values`);
    }
  }
  
  const processedShape: [number, number] = [result.shape[0], result.shape[1]];
  
  return {
    data: result,
    originalShape,
    processedShape,
    operationsApplied,
    columnChanges,
  };
}

// Parse LLM instructions to processing options
export function parseInstructions(instructions: string): ProcessOptions {
  const lower = instructions.toLowerCase();
  const options: ProcessOptions = {};
  
  // Normalize
  if (lower.includes('normaliz') || lower.includes('scale') || lower.includes('standardiz')) {
    options.normalize = true;
  }
  
  // Encoding
  if (lower.includes('one-hot') || lower.includes('one hot') || lower.includes('encode categorical')) {
    options.encoding = 'onehot';
  } else if (lower.includes('label encod')) {
    options.encoding = 'label';
  }
  
  // Missing values
  if (lower.includes('drop') && lower.includes('missing')) {
    options.handleMissing = 'drop';
  } else if (lower.includes('fill') && (lower.includes('mean') || lower.includes('average'))) {
    options.handleMissing = 'mean';
  } else if (lower.includes('fill') && lower.includes('median')) {
    options.handleMissing = 'median';
  } else if (lower.includes('fill') && lower.includes('mode')) {
    options.handleMissing = 'mode';
  }
  
  // Outliers
  if (lower.includes('remove outlier') || lower.includes('outlier removal')) {
    options.removeOutliers = true;
    options.outlierMethod = lower.includes('iqr') ? 'iqr' : 'zscore';
  }
  
  // Train/test split
  if (lower.includes('train') && lower.includes('test') && lower.includes('split')) {
    options.trainTestSplit = true;
    
    // Extract test size
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
