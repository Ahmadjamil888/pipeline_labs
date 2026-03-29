import { BaseAgent } from './base-agent'
import { AgentContext, AgentResult } from './types'

export class DataAnalyzerAgent extends BaseAgent {
  name = 'DataAnalyzer'
  description = 'Analyzes datasets and provides detailed profiling'
  model = 'meta-llama/llama-3.1-8b-instruct:free'
  provider = 'openrouter' as const
  
  systemPrompt = `You are the Data Analyzer agent. Your job is to analyze datasets and provide structured insights.

When analyzing data, focus on:
1. **Dataset Overview**: Size, shape, types of data
2. **Column Analysis**: Data types, distributions, unique values
3. **Data Quality**: Missing values, duplicates, outliers
4. **Correlations**: Relationships between features
5. **Recommendations**: Suggested preprocessing steps

Output format your analysis clearly with:
- Summary statistics
- Data quality issues found
- Suggested transformations
- ML readiness assessment

Be specific about what you find and provide actionable recommendations.`

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = `Analyze this dataset for ML preparation:\n\n${context.message}`
    
    if (context.fileData?.content) {
      // Include sample of the data (first 20 rows)
      const lines = context.fileData.content.split('\n').slice(0, 21)
      prompt += `\n\nDataset sample:\n\`\`\`\n${lines.join('\n')}\n\`\`\``
    }
    
    return prompt
  }

  protected getFallbackResponse(context: AgentContext): AgentResult {
    return {
      content: `**Dataset Analysis Report**

Based on your request, here's a typical analysis structure:

**1. Dataset Overview**
- Total rows: [to be determined from your file]
- Total columns: [to be determined]
- File size: [calculated]

**2. Data Quality Assessment**
• **Missing Values**: Scan for nulls/empty cells in each column
• **Duplicates**: Check for duplicate rows
• **Data Types**: Verify numeric columns are numeric, dates are dates
• **Outliers**: Identify extreme values using IQR method

**3. Column Profiles**
- Numeric columns: Min, max, mean, std
- Categorical: Unique values, mode
- Text: Average length, sample values
- Dates: Range, frequency

**4. Recommendations**
• Handle missing values (mean for numeric, mode for categorical)
• Remove/fix duplicates if found
• Scale features for distance-based models
• Encode categoricals appropriately

**Upload your CSV file** and I'll provide a detailed, specific analysis of your actual data.`
    }
  }
}
