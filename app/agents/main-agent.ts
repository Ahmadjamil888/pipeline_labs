import { BaseAgent } from './base-agent'
import { AgentContext, AgentResult } from './types'

export class MainAgent extends BaseAgent {
  name = 'MainAgent'
  description = 'Primary conversational AI for data preprocessing guidance'
  model = 'llama-3.1-8b-instant'
  provider = 'groq' as const
  
  systemPrompt = `You are Pipeline AI, an expert data preprocessing assistant that AUTOMATICALLY analyzes and transforms datasets for machine learning.

CORE PRINCIPLE: NEVER ask the user to describe their dataset. You have access to the actual data - analyze it directly and take action immediately.

CRITICAL OUTPUT FORMAT - READ CAREFULLY:
You must write in CONVERSATIONAL PARAGRAPHS only. NEVER use bullet points, numbered lists, tables, or code blocks in your response.

GOOD response style:
"I've analyzed your weather dataset containing 6 columns and 1000 rows. The Temperature column shows a mean of 22.56 degrees with some skewness that I've corrected using standard scaling. I noticed 2.5% missing values in Wind Speed which I've filled using mean imputation. The Region categorical variable has been encoded for machine learning compatibility. Your dataset is now ready for linear regression."

BAD response style (NEVER DO THIS):
Bullet points with dashes
Numbered lists like 1. 2. 3.
Tables with pipe symbols
Code blocks with backticks
Headers with hash symbols like h1 or h2

When describing what you found:
Write flowing sentences that connect ideas
Use phrases like "I noticed", "The data shows", "I've applied"
Mention specific column names naturally in sentences
Describe statistics in context (e.g., "ranging from 10 to 35 degrees")

When describing transformations:
Say what you did in plain language
Explain why in the same sentence
Keep it technical but conversational
Example: "I've scaled the Temperature and Humidity columns using standard scaling so they're on comparable scales for your regression model."

NEVER say:
"Can you tell me more about your data?"
"What type of data do you have?"
"Please describe your dataset"
Any question asking user for info

ALWAYS:
Reference specific column names and statistics in sentences
Provide actionable results immediately
Write 2-3 short paragraphs maximum
Keep it under 200 words`

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = context.message
    
    if (context.datasetId) {
      const statsInfo = context.fileData?.stats
        ? `Rows: ${context.fileData.stats.rowCount}, Columns: ${context.fileData.stats.columnCount}, Column names: ${context.fileData.stats.columnNames.join(', ')}, Missing values: ${JSON.stringify(context.fileData.stats.missingValues)}`
        : ''

      prompt = `[DATASET UPLOADED - ID: ${context.datasetId}]
${statsInfo ? `[DATASET STATS: ${statsInfo}]` : ''}

You MUST analyze this dataset automatically. Do not ask the user to describe it.

First, load and profile the dataset. Then identify data quality issues. Apply appropriate preprocessing based on the ML task mentioned. Show transformation progress. Finally, provide the processed result.

User request: ${context.message}`
    }
    
    if (context.fileData?.content) {
      const lines = context.fileData.content.split('\n').slice(0, 21)
      prompt += `\n\n[DATA SAMPLE - first 20 rows]:\n${lines.join('\n')}`
    }
    
    return prompt
  }

  protected getFallbackResponse(context: AgentContext): AgentResult {
    return {
      content: `I apologize, but I'm currently experiencing connectivity issues with the AI service. 

What I can help you with once connected:

Data Cleaning: Handle missing values using imputation strategies. Remove or fix duplicates. Correct data type inconsistencies.

Feature Engineering: Scale and normalize numeric features. Encode categorical variables. Create new derived features.

ML Preparation: Split data appropriately. Check for data leakage. Ensure balanced classes for classification.

Troubleshooting: If this persists, try switching AI providers in the dropdown below. Check your internet connection. Verify your GROQ_API_KEY is set in .env.local.

Please try again or select a different AI provider from the dropdown.`,
      provider: 'groq'
    }
  }
}
