export const PLAN_TIERS = [
  "free",
  "monthly",
  "annual",
  "family",
  "church_basic",
  "church_pro",
] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = ["active", "banned"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/** ~100 years — Supabase ban_duration for "permanent" */
export const BAN_DURATION_PERMANENT = "876000h";

export function isPlanTier(v: string): v is PlanTier {
  return (PLAN_TIERS as readonly string[]).includes(v);
}

export function isUserRole(v: string): v is UserRole {
  return (USER_ROLES as readonly string[]).includes(v);
}

export function formatPlanTier(tier: string): string {
  return tier
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
