import { Agent, AgentContext, AgentResult, AIProvider } from './types'
import { AIService } from '../api/ai/route'

export abstract class BaseAgent implements Agent {
  abstract name: string
  abstract description: string
  abstract model: string
  abstract provider: AIProvider
  abstract systemPrompt: string

  async handle(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now()
    
    // Use context provider/model or fall back to agent defaults
    const provider = context.provider || this.provider
    const model = context.model || this.model

    try {
      // Directly use AIService instead of HTTP call for reliability
      const messages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...context.history.slice(-5).map(h => ({ 
          role: h.role as 'user' | 'assistant', 
          content: h.content 
        })),
        { role: 'user' as const, content: this.buildUserPrompt(context) }
      ]

      const aiService = new AIService({ provider, model })
      const result = await aiService.chat(messages, 0.7, 800) // Limit to 800 tokens for concise responses
      
      return {
        content: result.content || '',
        processingTime: Date.now() - startTime,
        provider: result.provider
      }
    } catch (error) {
      console.error(`${this.name} error:`, error)
      return this.getFallbackResponse(context)
    }
  }

  protected abstract buildUserPrompt(context: AgentContext): string
  protected abstract getFallbackResponse(context: AgentContext): AgentResult
}
