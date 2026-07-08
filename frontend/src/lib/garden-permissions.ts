import { t, type MessageKey } from "@/i18n";
import type { GardenOrganization } from "@/lib/garden-api";

export function canWriteGarden(organization?: GardenOrganization | null) {
  return organization?.role === "owner" || organization?.role === "worker";
}

export function canManageGardenOrganization(organization?: GardenOrganization | null) {
  return organization?.role === "owner";
}

export function isPrivateGarden(organization?: GardenOrganization | null) {
  return !organization || organization.type === "private";
}

export function isBusinessGarden(organization?: GardenOrganization | null) {
  return organization?.type === "business";
}

const roleKeys: Record<string, MessageKey> = {
  owner: "app.roles.owner",
  worker: "app.roles.worker",
  viewer: "app.roles.viewer",
};

export function roleLabel(role?: string) {
  return role && roleKeys[role] ? t(roleKeys[role]) : t("app.roles.none");
}

export function taskPriorityLabel(priority: "low" | "medium" | "high") {
  return t(`app.taskPriority.${priority}`);
}

export function taskTypeLabel(kind: string) {
  const key = `app.taskType.${kind}` as MessageKey;
  const value = t(key);
  return value === key ? kind : value;
}

export function taskStatusLabel(status: string) {
  const key = `app.taskStatus.${status}` as MessageKey;
  const value = t(key);
  return value === key ? status : value;
}

export function plantStatusLabel(status: string) {
  const key = `app.plantStatus.${status}` as MessageKey;
  const value = t(key);
  return value === key ? status : value;
}

export function plantHealthLabel(health: string) {
  const key = `app.plantHealth.${health}` as MessageKey;
  const value = t(key);
  return value === key ? health : value;
}

export function repeatRuleLabel(value?: string | null) {
  if (!value) return t("app.repeatRule.none");
  const key = `app.repeatRule.${value}` as MessageKey;
  const resolved = t(key);
  return resolved === key ? value : resolved;
}
