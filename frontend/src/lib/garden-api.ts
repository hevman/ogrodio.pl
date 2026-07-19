import { t } from "@/i18n";

export type GardenProfile = {
  city: string;
  region: string;
  climateZone: string;
  soilType: string;
  latitude?: number | null;
  longitude?: number | null;
  weeklyDigestEnabled?: boolean;
  updatedAt?: string;
};

export type PlantDefinition = {
  type: string;
  label: string;
  category: string;
  defaultName: string;
};

export type GardenPlant = {
  id: number;
  plantType: string;
  displayName: string;
  location: string;
  locationId?: number | null;
  locationName?: string | null;
  status?: string;
  quantity?: number;
  variety?: string;
  batchCode?: string;
  healthStatus?: string;
  plantedAt?: string | null;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GardenTask = {
  id: string;
  plantId?: number | null;
  plantName?: string;
  plantType?: string;
  locationId?: number | null;
  locationName?: string;
  assignedUserId?: number | null;
  assignedUserName?: string;
  assignedUserEmail?: string;
  month: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  kind: "watering" | "fertilizing" | "cutting" | "inspection" | "protection" | "custom";
  status?: "suggested" | "open" | "done" | "skipped";
  dueDate?: string | null;
  repeatRule?: string;
  articleHref?: string | null;
  source?: "seasonal" | "manual";
  templateId?: string;
  completedAt?: string | null;
  createdAt?: string;
  createdByName?: string;
};

export type GardenOrganization = {
  id: number;
  name: string;
  type: "private" | "business";
  role: string;
};

export type GardenMember = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: "owner" | "worker" | "viewer";
  createdAt?: string;
};

export type GardenInvitation = {
  id: number;
  email: string;
  role: "worker" | "viewer";
  token?: string;
  status: "pending" | "accepted" | "cancelled";
  organizationName?: string;
  organizationType?: string;
  invitedByName?: string;
  acceptedByName?: string;
  expiresAt?: string;
  acceptedAt?: string;
  createdAt?: string;
};

export type GardenNotification = {
  id: string;
  type: "invitation" | "task" | "plant" | "journal" | "weather";
  priority?: "low" | "medium" | "high";
  title: string;
  description: string;
  href: string;
  createdAt?: string;
};

export type GardenRecommendedArticle = {
  slug: string;
  title: string;
  topic: string;
  summary: string;
  readingMinutes: number;
  coverImage?: string;
};

export type GardenLocation = {
  id: number;
  name: string;
  kind: string;
  notes: string;
  createdAt?: string;
};

export type GardenJournalEntry = {
  id: number;
  plantId?: number | null;
  plantName?: string;
  locationId?: number | null;
  locationName?: string;
  taskId?: number | null;
  taskTitle?: string;
  authorUserId?: number | null;
  authorName?: string;
  title: string;
  body: string;
  imageUrl?: string;
  happenedAt: string;
  createdAt?: string;
};

export type GardenWeatherDay = {
  date: string;
  weatherCode: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitation: number;
  windSpeedMax: number;
};

export type WeatherLocationResult = {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

export type GardenWeatherCurrent = {
  temperature: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
};

async function gardenRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/garden/${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || t("app.errors.fetchGardenFailed"));
  }
  return data as T;
}

export function fetchGardenCatalog() {
  return gardenRequest<{ plants: PlantDefinition[] }>("catalog");
}

export function fetchGardenOrganization() {
  return gardenRequest<GardenOrganization>("organization");
}

export function updateGardenOrganization(payload: { name: string; type: "private" | "business" }) {
  return gardenRequest<GardenOrganization>("organization", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchGardenMembers() {
  return gardenRequest<{ members: GardenMember[] }>("organization/members");
}

export function addGardenMember(payload: { email: string; role: "worker" | "viewer" }) {
  return gardenRequest<{ member: GardenMember }>("organization/members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGardenMember(id: number, payload: { role: "worker" | "viewer" }) {
  return gardenRequest<{ member: GardenMember }>(`organization/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function removeGardenMember(id: number) {
  return gardenRequest<{ ok: true }>(`organization/members/${id}`, { method: "DELETE" });
}

export function fetchGardenOrganizationInvitations() {
  return gardenRequest<{ invitations: GardenInvitation[] }>("organization/invitations");
}

export function createGardenInvitation(payload: { email: string; role: "worker" | "viewer" }) {
  return gardenRequest<{ invitation: GardenInvitation }>("organization/invitations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelGardenInvitation(id: number) {
  return gardenRequest<{ invitation: GardenInvitation }>(`organization/invitations/${id}/cancel`, { method: "POST" });
}

export function fetchMyGardenInvitations() {
  return gardenRequest<{ invitations: GardenInvitation[] }>("invitations");
}

export function acceptGardenInvitation(id: number) {
  return gardenRequest<{ invitation: GardenInvitation }>(`invitations/${id}/accept`, { method: "POST" });
}

export function fetchGardenNotifications() {
  return gardenRequest<{ unreadCount: number; items: GardenNotification[] }>("notifications");
}

export function fetchGardenRecommendations() {
  return gardenRequest<{ articles: GardenRecommendedArticle[]; matchedPlantTypes: string[] }>("recommendations");
}

export function fetchGardenProfile() {
  return gardenRequest<GardenProfile>("profile");
}

export function updateGardenProfile(profile: GardenProfile) {
  return gardenRequest<GardenProfile>("profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function fetchGardenWeather() {
  return gardenRequest<{
    profile: GardenProfile;
    locationLabel: string | null;
    current: GardenWeatherCurrent | null;
    forecast: GardenWeatherDay[];
    alerts: GardenNotification[];
  }>("weather");
}

export function searchWeatherLocations(query: string) {
  const params = new URLSearchParams({ q: query });
  return gardenRequest<{ locations: WeatherLocationResult[] }>(`weather/locations?${params.toString()}`);
}

export function fetchGardenPlants() {
  return gardenRequest<{ plants: GardenPlant[] }>("plants");
}

export function fetchGardenPlant(id: number | string) {
  return gardenRequest<{ plant: GardenPlant }>(`plants/${id}`);
}

export function addGardenPlant(payload: {
  plantType: string;
  displayName?: string;
  location?: string;
  locationId?: number | null;
  quantity?: number;
  status?: string;
  variety?: string;
  batchCode?: string;
  healthStatus?: string;
  plantedAt?: string;
  notes?: string;
}) {
  return gardenRequest<{ plant: GardenPlant }>("plants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGardenPlant(id: number | string, payload: {
  displayName?: string;
  location?: string;
  locationId?: number | null;
  quantity?: number;
  status?: string;
  variety?: string;
  batchCode?: string;
  healthStatus?: string;
  plantedAt?: string | null;
  notes?: string;
}) {
  return gardenRequest<{ plant: GardenPlant }>(`plants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function removeGardenPlant(id: number) {
  return gardenRequest<{ ok: true }>(`plants/${id}`, { method: "DELETE" });
}

export function fetchGardenTasks(month?: number) {
  const suffix = month ? `tasks?month=${month}` : "tasks";
  return gardenRequest<{ month: number; tasks: GardenTask[] }>(suffix);
}

export function fetchGardenTask(id: number | string) {
  return gardenRequest<{ task: GardenTask }>(`tasks/${id}`);
}

export function addGardenTask(payload: {
  title: string;
  description?: string;
  kind?: string;
  priority?: string;
  dueDate?: string;
  plantId?: number | null;
  locationId?: number | null;
  assignedUserId?: number | null;
  repeatRule?: string;
}) {
  return gardenRequest<{ task: GardenTask }>("tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function acceptSeasonalGardenTask(payload: {
  plantId: number;
  templateId: string;
  month: number;
  dueDate?: string;
}) {
  return gardenRequest<{ task: GardenTask }>("tasks/seasonal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGardenTask(id: string | number, payload: { status?: "open" | "done" | "skipped"; assignedUserId?: number | null }) {
  return gardenRequest<GardenTask>(`tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function fetchGardenLocations() {
  return gardenRequest<{ locations: GardenLocation[] }>("locations");
}

export function addGardenLocation(payload: { name: string; kind?: string; notes?: string }) {
  return gardenRequest<{ location: GardenLocation }>("locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchGardenJournal() {
  return gardenRequest<{ entries: GardenJournalEntry[] }>("journal");
}

export function fetchGardenJournalEntry(id: number | string) {
  return gardenRequest<{ entry: GardenJournalEntry }>(`journal/${id}`);
}

export function addGardenJournalEntry(payload: {
  title: string;
  body?: string;
  imageUrl?: string;
  happenedAt?: string;
  plantId?: number | null;
  locationId?: number | null;
  taskId?: number | null;
}) {
  return gardenRequest<{ entry: GardenJournalEntry }>("journal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadGardenJournalImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/garden/media/journal", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || t("app.errors.uploadImageFailed"));
  }
  return data as { url: string; mimeType: string; size: number };
}
