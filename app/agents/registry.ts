import { Agent } from './types'
import { MainAgent } from './main-agent'
import { DataAnalyzerAgent } from './analyzer-agent'
import { PlannerAgent } from './planner-agent'
import { ExecutorAgent } from './executor-agent'

// Agent Registry - manages all available agents
class AgentRegistry {
  private agents: Map<string, Agent> = new Map()

  constructor() {
    // Register all agents
    this.register(new MainAgent())
    this.register(new DataAnalyzerAgent())
    this.register(new PlannerAgent())
    this.register(new ExecutorAgent())
  }

  register(agent: Agent): void {
    this.agents.set(agent.name.toLowerCase(), agent)
  }

  get(name: string): Agent | undefined {
    return this.agents.get(name.toLowerCase())
  }

  getDefault(): Agent {
    return this.agents.get('mainagent')!
  }

  list(): Agent[] {
    return Array.from(this.agents.values())
  }

  // Determine best agent based on user intent
  async route(message: string): Promise<Agent> {
    const lowerMsg = message.toLowerCase()
    
    // Route based on keywords
    if (lowerMsg.includes('analyze') || lowerMsg.includes('profile') || lowerMsg.includes('describe')) {
      return this.get('dataanalyzer') || this.getDefault()
    }
    
    if (lowerMsg.includes('plan') || lowerMsg.includes('pipeline') || lowerMsg.includes('steps')) {
      return this.get('planner') || this.getDefault()
    }
    
    if (lowerMsg.includes('execute') || lowerMsg.includes('process') || lowerMsg.includes('transform') || lowerMsg.includes('clean')) {
      return this.get('executor') || this.getDefault()
    }
    
    // Default to main agent
    return this.getDefault()
  }
}

// Export singleton instance
export const agentRegistry = new AgentRegistry()
