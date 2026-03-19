// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    maxProjects: 3,
    canInviteMembers: false,
    maxMembers: 1,
    customDomain: false,
    exclusiveApi: false,
    expandedDisk: false,
  },
  pro: {
    name: 'Pro',
    maxProjects: 30,
    canInviteMembers: true,
    maxMembers: 5,
    customDomain: true,
    exclusiveApi: false,
    expandedDisk: false,
  },
  team: {
    name: 'Team',
    maxProjects: 150,
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
