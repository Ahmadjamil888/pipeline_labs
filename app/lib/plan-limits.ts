// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    maxProjects: 3,
    maxDatasets: 10,
    maxRowsPerDataset: 10000,
    maxFileSizeMB: 10,
    apiKeys: 1,
    canInviteMembers: false,
    maxMembers: 1,
    customDomain: false,
    exclusiveApi: false,
    expandedDisk: false,
  },
  pro: {
    name: 'Pro',
    maxProjects: 30,
    maxDatasets: 100,
    maxRowsPerDataset: 100000,
    maxFileSizeMB: 100,
    apiKeys: 5,
    canInviteMembers: true,
    maxMembers: 5,
    customDomain: true,
    exclusiveApi: false,
    expandedDisk: false,
  },
  team: {
    name: 'Team',
    maxProjects: 150,
    maxDatasets: Infinity,
    maxRowsPerDataset: 1000000,
    maxFileSizeMB: 500,
    apiKeys: Infinity,
    canInviteMembers: true,
    maxMembers: 20,
    customDomain: true,
    exclusiveApi: true,
    expandedDisk: true,
  },
}

export type PlanType = 'free' | 'pro' | 'team'

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function canCreateProject(plan: PlanType, currentProjectCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentProjectCount < limits.maxProjects
}

export function canInviteMember(plan: PlanType, currentMemberCount: number): boolean {
  const limits = getPlanLimits(plan)
  if (!limits.canInviteMembers) return false
  return currentMemberCount < limits.maxMembers
}

export function getProjectLimitMessage(plan: PlanType): string {
  const limits = getPlanLimits(plan)
  if (plan === 'free') {
    return `Free plan: Maximum ${limits.maxProjects} projects. Upgrade to Pro for ${PLAN_LIMITS.pro.maxProjects} projects.`
  }
  if (plan === 'pro') {
    return `Pro plan: Maximum ${limits.maxProjects} projects per month. Upgrade to Team for ${PLAN_LIMITS.team.maxProjects} projects.`
  }
  return `Team plan: Maximum ${limits.maxProjects} projects per month.`
}

// Dataset limits
export function canProcessDataset(plan: PlanType, currentDatasetCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentDatasetCount < limits.maxDatasets
}

export function getDatasetLimitMessage(plan: PlanType): string {
  const limits = PLAN_LIMITS[plan]
  return `Your ${plan} plan includes up to ${limits.maxDatasets === Infinity ? 'unlimited' : limits.maxDatasets} datasets. Upgrade to process more datasets.`
}

export function canUploadFile(plan: PlanType, fileSizeMB: number): boolean {
  return fileSizeMB <= PLAN_LIMITS[plan].maxFileSizeMB
}

export function getFileSizeLimit(plan: PlanType): number {
  return PLAN_LIMITS[plan].maxFileSizeMB
}

// API Key limits
export function canCreateApiKey(plan: PlanType, currentKeyCount: number): boolean {
  return currentKeyCount < PLAN_LIMITS[plan].apiKeys
}

export function getApiKeyLimitMessage(plan: PlanType): string {
  const limits = PLAN_LIMITS[plan]
  return `Your ${plan} plan includes ${limits.apiKeys === Infinity ? 'unlimited' : limits.apiKeys} API key${limits.apiKeys === 1 ? '' : 's'}.`
}
