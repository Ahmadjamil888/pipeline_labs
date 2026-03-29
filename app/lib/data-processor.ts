// Simple CSV data processor (works without heavy dependencies)

export interface DataStats {
  rowCount: number
  columnCount: number
  columns: ColumnInfo[]
  missingValues: { column: string; count: number }[]
}

export interface ColumnInfo {
  name: string
  type: 'numeric' | 'categorical' | 'text' | 'date'
  uniqueCount: number
  missingCount: number
  sampleValues: any[]
  stats?: {
    min?: number
    max?: number
    mean?: number
    std?: number
  }
}

export interface PreprocessOptions {
  handleMissing?: 'drop' | 'mean' | 'median' | 'mode' | 'fill'
  fillValue?: any
  removeDuplicates?: boolean
  scaleMethod?: 'standard' | 'minmax' | 'none'
  encodeCategorical?: 'onehot' | 'label' | 'none'
}

export class DataProcessor {
  private data: any[] = []
  private headers: string[] = []

  parseCSV(content: string): void {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) return

    // Parse headers
    this.headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Parse data rows
    this.data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: any = {}
      this.headers.forEach((h, i) => {
        row[h] = this.parseValue(values[i])
      })
      return row
    })
  }

  private parseValue(value: string): any {
    if (value === '' || value === null || value === undefined) return null
    
    // Try numeric
    const num = Number(value)
    if (!isNaN(num) && value !== '') return num
    
    // Try boolean
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
    
    // Try date
    const date = new Date(value)
    if (!isNaN(date.getTime()) && value.includes('-')) return date
    
    // Return as string
    return value
  }

  getStats(): DataStats {
    const columns: ColumnInfo[] = this.headers.map(header => {
      const values = this.data.map(row => row[header])
      const nonNullValues = values.filter(v => v !== null && v !== undefined)
      const uniqueValues = [...new Set(nonNullValues)]
      
      // Determine type
      let type: ColumnInfo['type'] = 'categorical'
      if (nonNullValues.every(v => typeof v === 'number')) {
        type = 'numeric'
      } else if (nonNullValues.every(v => v instanceof Date)) {
        type = 'date'
      } else if (uniqueValues.length > 20 && nonNullValues.every(v => typeof v === 'string')) {
        type = 'text'
      }

      const info: ColumnInfo = {
        name: header,
        type,
        uniqueCount: uniqueValues.length,
        missingCount: values.length - nonNullValues.length,
        sampleValues: nonNullValues.slice(0, 5)
      }

      // Calculate numeric stats
      if (type === 'numeric') {
        const nums = nonNullValues as number[]
        const sum = nums.reduce((a, b) => a + b, 0)
        const mean = sum / nums.length
        const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / nums.length
        
        info.stats = {
          min: Math.min(...nums),
          max: Math.max(...nums),
          mean,
          std: Math.sqrt(variance)
        }
      }

      return info
    })

    return {
      rowCount: this.data.length,
      columnCount: this.headers.length,
      columns,
      missingValues: columns
        .filter(c => c.missingCount > 0)
        .map(c => ({ column: c.name, count: c.missingCount }))
    }
  }

  preprocess(options: PreprocessOptions): any[] {
    let processed = [...this.data]

    // Handle missing values
    if (options.handleMissing && options.handleMissing !== 'drop') {
      const stats = this.getStats()
      
      processed = processed.map(row => {
        const newRow = { ...row }
        
        stats.columns.forEach(col => {
          if (newRow[col.name] === null || newRow[col.name] === undefined) {
            switch (options.handleMissing) {
              case 'mean':
                if (col.type === 'numeric' && col.stats) {
                  newRow[col.name] = col.stats.mean
                }
                break
              case 'median':
                // Simplified - use mean for now
                if (col.type === 'numeric' && col.stats) {
                  newRow[col.name] = col.stats.mean
                }
                break
              case 'mode':
                // Use first sample value as mode approximation
                if (col.sampleValues.length > 0) {
                  newRow[col.name] = col.sampleValues[0]
                }
                break
              case 'fill':
                newRow[col.name] = options.fillValue
                break
            }
          }
        })
        
        return newRow
      })
    }

    // Remove duplicates
    if (options.removeDuplicates) {
      const seen = new Set<string>()
      processed = processed.filter(row => {
        const key = JSON.stringify(row)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    // Scale numeric features
    if (options.scaleMethod && options.scaleMethod !== 'none') {
      const stats = this.getStats()
      const numericCols = stats.columns.filter(c => c.type === 'numeric' && c.stats)
      
      processed = processed.map(row => {
        const newRow = { ...row }
        
        numericCols.forEach(col => {
          if (typeof newRow[col.name] === 'number' && col.stats) {
            if (options.scaleMethod === 'standard' && col.stats.std && col.stats.std > 0) {
              newRow[col.name] = (newRow[col.name] - (col.stats.mean || 0)) / col.stats.std
            } else if (options.scaleMethod === 'minmax') {
              const range = (col.stats.max ?? 0) - (col.stats.min ?? 0)
              if (range > 0) {
                newRow[col.name] = (newRow[col.name] - (col.stats.min ?? 0)) / range
              }
            }
          }
        })
        
        return newRow
      })
    }

    return processed
  }

  toCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const lines = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`
          return String(val)
        }).join(',')
      )
    ]
    
    return lines.join('\n')
  }
}
