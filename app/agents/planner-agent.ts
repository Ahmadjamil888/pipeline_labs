import { BaseAgent } from './base-agent'
import { AgentContext, AgentResult } from './types'

export class PlannerAgent extends BaseAgent {
  name = 'Planner'
  description = 'Creates step-by-step preprocessing pipelines'
  model = 'llama-3.3-70b-versatile'
  provider = 'groq' as const
  
  systemPrompt = `You are the Preprocessing Planner agent. Your job is to create detailed, step-by-step preprocessing pipelines.

When creating a pipeline, consider:
1. **ML Algorithm Requirements**: KNN needs scaling, trees don't
2. **Data Quality Issues**: What needs fixing first
3. **Execution Order**: Clean → Transform → Encode → Scale
4. **Feature Types**: Numeric, categorical, text, datetime
5. **Validation**: How to verify each step

Output format:
**Preprocessing Pipeline for [Algorithm]**

**Step 1: [Action]**
- What: Description
- Why: Reasoning
- How: Implementation details

Continue for all steps...

**Final Validation:**
- Checks to perform
- Expected outcomes

Be specific about parameters and methods.`

  protected buildUserPrompt(context: AgentContext): string {
    return `Create a preprocessing pipeline for:\n\n${context.message}\n\nPlease provide detailed steps with specific methods and parameters.`
  }

  protected getFallbackResponse(context: AgentContext): AgentResult {
    return {
      content: `**Preprocessing Pipeline Plan**

**For: General ML Preparation**

**Step 1: Data Cleaning**
• **Action**: Handle missing values
• **Method**: 
  - Numeric: Fill with median (robust to outliers)
  - Categorical: Fill with mode or "Unknown"
• **Validation**: Check no nulls remain

**Step 2: Remove Duplicates**
• **Action**: Drop duplicate rows
• **Method**: df.drop_duplicates()
• **Validation**: Count before/after

**Step 3: Outlier Treatment**
• **Action**: Cap extreme values
• **Method**: IQR method (1.5 * IQR rule)
• **Validation**: Visual inspection or statistical tests

**Step 4: Feature Scaling** (for distance-based models)
• **Action**: Normalize numeric features
• **Options**:
  - StandardScaler: (x - mean) / std
  - MinMaxScaler: (x - min) / (max - min)
• **When**: Use StandardScaler for normal distributions, MinMax for bounded

**Step 5: Categorical Encoding**
• **Action**: Convert categories to numbers
• **Methods**:
  - One-hot: For nominal (no order)
  - Label: For ordinal (has order)
• **Validation**: Check no string columns remain

**Step 6: Feature Engineering** (optional)
• Create interaction terms
• Polynomial features
• Binning continuous variables

**Step 7: Train/Test Split**
• **Split**: 80/20 or 70/30
• **Stratify**: For classification, preserve class balance
• **Shuffle**: Yes, with fixed random seed

**Step 8: Final Validation**
• Check for data leakage
• Verify shapes
• Preview processed data

Would you like me to execute this pipeline on your specific dataset?`
    }
  }
}
